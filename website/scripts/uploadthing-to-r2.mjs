// Copies every UploadThing file the SAT database uses to Cloudflare R2 and (optionally) rewrites the URLs.
//
// Run in website/ (reads DATABASE_URL and R2_* from .env):
//   node --env-file=.env scripts/uploadthing-to-r2.mjs            1. report only: what would be copied
//   node --env-file=.env scripts/uploadthing-to-r2.mjs --copy     2. copy the files to R2 (database unchanged)
//   node --env-file=.env scripts/uploadthing-to-r2.mjs --apply    3. copy what's missing, then rewrite URLs in the database
//
// Safe to run again: copied files are remembered in scripts/uploadthing-to-r2.map.json and skipped.
// It searches EVERY text/json column of every table (image URLs also sit inside lesson/question JSON),
// so nothing is missed. Make a Neon backup branch before --apply.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";

const MODE = process.argv.includes("--apply") ? "apply" : process.argv.includes("--copy") ? "copy" : "report";
const MAP_FILE = new URL("./uploadthing-to-r2.map.json", import.meta.url);
const URL_RE = /https:\/\/(?:utfs\.io|uploadthing\.com|[a-z0-9]+\.ufs\.sh)\/f\/[A-Za-z0-9._~%-]+/g;
const SQL_RE = "https://(utfs\\.io|uploadthing\\.com|[a-z0-9]+\\.ufs\\.sh)/f/";

const EXT = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg",
  "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm", "application/pdf": "pdf",
};

const db = new PrismaClient();
const map = existsSync(MAP_FILE) ? JSON.parse(readFileSync(MAP_FILE, "utf8")) : {};
const saveMap = () => writeFileSync(MAP_FILE, JSON.stringify(map, null, 1));
const q = (id) => `"${id.replace(/"/g, '""')}"`;

function need(name) {
  if (!process.env[name]) throw new Error(`${name} is not set in .env`);
  return process.env[name];
}

async function findUsages() {
  const cols = await db.$queryRawUnsafe(`
    SELECT table_name AS t, column_name AS c, data_type AS type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name NOT LIKE '\\_prisma%'
      AND data_type IN ('text', 'character varying', 'json', 'jsonb')`);
  const usages = []; // { t, c, type, urls: Set }
  for (const { t, c, type } of cols) {
    const rows = await db.$queryRawUnsafe(`SELECT ${q(c)}::text AS v FROM ${q(t)} WHERE ${q(c)}::text ~ $1`, SQL_RE);
    if (!rows.length) continue;
    const urls = new Set(rows.flatMap((r) => r.v.match(URL_RE) || []));
    usages.push({ t, c, type, rows: rows.length, urls });
  }
  return usages;
}

async function copyAll(urls) {
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${need("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: need("R2_ACCESS_KEY_ID"), secretAccessKey: need("R2_SECRET_ACCESS_KEY") },
  });
  const bucket = need("R2_BUCKET");
  const base = need("R2_PUBLIC_URL").replace(/\/$/, "");
  let n = 0, failed = 0;
  for (const url of urls) {
    n++;
    if (map[url]) continue;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const type = (res.headers.get("content-type") || "application/octet-stream").split(";")[0].trim();
      const body = Buffer.from(await res.arrayBuffer());
      const fileKey = decodeURIComponent(url.split("/f/")[1]);
      const key = `uploadthing/${fileKey}${/\.[a-z0-9]{2,5}$/i.test(fileKey) || !EXT[type] ? "" : `.${EXT[type]}`}`;
      await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: type, CacheControl: "public, max-age=31536000, immutable" }));
      await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key })); // make sure it's there
      map[url] = `${base}/${key}`;
      saveMap();
      console.log(`[${n}/${urls.length}] ok   ${(body.length / 1024).toFixed(0)} KB  ${url}`);
    } catch (e) {
      failed++;
      console.log(`[${n}/${urls.length}] FAIL ${url}  (${e.message})`);
    }
  }
  return failed;
}

async function rewrite(usages) {
  let changed = 0;
  for (const { t, c, type, urls } of usages) {
    for (const url of urls) {
      const to = map[url];
      if (!to) continue;
      const cast = type === "jsonb" ? "::jsonb" : type === "json" ? "::json" : "";
      changed += await db.$executeRawUnsafe(
        `UPDATE ${q(t)} SET ${q(c)} = REPLACE(${q(c)}::text, $1, $2)${cast} WHERE ${q(c)}::text LIKE '%' || $1 || '%'`,
        url, to,
      );
    }
  }
  return changed;
}

const usages = await findUsages();
const all = [...new Set(usages.flatMap((u) => [...u.urls]))];
console.log(`\nUploadThing files used by the database: ${all.length} (${all.filter((u) => map[u]).length} already copied)`);
for (const u of usages) console.log(`  ${u.t}.${u.c}: ${u.rows} rows, ${u.urls.size} files`);

if (MODE === "report") {
  console.log("\nNothing changed. Next: --copy (copies files only), then --apply (rewrites URLs).");
} else {
  const failed = await copyAll(all);
  console.log(`\nCopied: ${all.filter((u) => map[u]).length}/${all.length}${failed ? `, ${failed} failed (run again to retry)` : ""}`);
  if (MODE === "apply") {
    const changed = await rewrite(usages);
    console.log(`Rows updated: ${changed}. Files that failed keep their old UploadThing URL.`);
  } else {
    console.log("Database unchanged. Open a few R2 URLs from scripts/uploadthing-to-r2.map.json, then run --apply.");
  }
}
await db.$disconnect();
