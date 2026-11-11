import "server-only";
import { ListObjectsV2Command, DeleteObjectsCommand, type _Object } from "@aws-sdk/client-s3";
import { db } from "@/lib/db";
import { r2 } from "@/lib/r2";

/**
 * Deletes R2 files that nothing in the database links to any more: removed or replaced
 * videos/images, deleted lessons and questions, uploads that were never saved.
 *
 * A file is only deleted when ALL of these hold:
 * - no text/json column of any table contains its public URL (lesson content included)
 * - it was uploaded more than MIN_AGE_HOURS ago, so an upload that isn't saved yet is safe
 * Safety stops (nothing is deleted): the database has no R2 links at all, or more than
 * half of the bucket would go. Both mean something is misconfigured, not that files are unused.
 */
const MIN_AGE_HOURS = 24;
const MAX_SHARE = 0.5;

const q = (id: string) => `"${id.replace(/"/g, '""')}"`;

async function listBucket(bucket: string) {
  const all: _Object[] = [];
  let token: string | undefined;
  do {
    const page = await r2().send(new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token }));
    all.push(...(page.Contents ?? []));
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return all;
}

/** Every bucket key the database links to, searched across every text and json column. */
async function referencedKeys(publicUrl: string) {
  const prefix = `${publicUrl}/`;
  const keyRe = new RegExp(`${prefix.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}([A-Za-z0-9._~%/-]+)`, "g");
  const cols = await db.$queryRawUnsafe<{ t: string; c: string }[]>(`
    SELECT table_name AS t, column_name AS c
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name NOT LIKE '\\_prisma%'
      AND data_type IN ('text', 'character varying', 'json', 'jsonb')`);
  const keys = new Set<string>();
  for (const { t, c } of cols) {
    const rows = await db.$queryRawUnsafe<{ v: string }[]>(
      `SELECT ${q(c)}::text AS v FROM ${q(t)} WHERE strpos(${q(c)}::text, $1) > 0`,
      prefix,
    );
    for (const { v } of rows) for (const m of v.matchAll(keyRe)) keys.add(decodeURIComponent(m[1]));
  }
  return keys;
}

export async function cleanupR2({ dryRun }: { dryRun: boolean }) {
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!bucket || !publicUrl) throw new Error("R2_BUCKET and R2_PUBLIC_URL must be set");

  const [objects, used] = await Promise.all([listBucket(bucket), referencedKeys(publicUrl)]);
  const cutoff = Date.now() - MIN_AGE_HOURS * 3600 * 1000;
  const unused = objects.filter((o) => o.Key && !used.has(o.Key) && (o.LastModified?.getTime() ?? Date.now()) < cutoff);
  const bytes = unused.reduce((sum, o) => sum + (o.Size ?? 0), 0);

  const summary = {
    dryRun,
    filesInBucket: objects.length,
    filesLinkedFromDatabase: used.size,
    unusedFiles: unused.length,
    unusedMB: Math.round((bytes / 1024 / 1024) * 10) / 10,
    unused: unused.map((o) => o.Key!),
    deleted: 0,
    stopped: null as string | null,
  };

  if (objects.length && !used.size) summary.stopped = "No R2 links found in the database. Nothing deleted.";
  else if (unused.length > 10 && unused.length > objects.length * MAX_SHARE)
    summary.stopped = `Would delete ${unused.length} of ${objects.length} files (more than half). Nothing deleted.`;
  if (dryRun || summary.stopped || !unused.length) return summary;

  for (let i = 0; i < unused.length; i += 1000) {
    const batch = unused.slice(i, i + 1000);
    const res = await r2().send(
      new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: batch.map((o) => ({ Key: o.Key! })), Quiet: true } }),
    );
    summary.deleted += batch.length - (res.Errors?.length ?? 0);
  }
  return summary;
}
