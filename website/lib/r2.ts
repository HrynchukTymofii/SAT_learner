import "server-only";
import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 (S3 compatible) for course images and lesson videos.
 * The browser uploads straight to R2 with a short-lived signed URL, so big videos never pass
 * through Vercel (which caps request bodies at 4.5 MB).
 *
 * Env: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET,
 *      R2_PUBLIC_URL (the bucket's public domain, e.g. https://media.satlearner.com)
 */
export const UPLOAD_KINDS = {
  image: {
    folder: "images",
    maxBytes: 10 * 1024 * 1024,
    types: { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg" },
  },
  video: {
    folder: "videos",
    maxBytes: 2 * 1024 * 1024 * 1024,
    types: { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" },
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_KINDS;

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

let client: S3Client | null = null;
export function r2() {
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env("R2_ACCESS_KEY_ID"), secretAccessKey: env("R2_SECRET_ACCESS_KEY") },
  });
  return client;
}

/** Returns a signed PUT URL (valid 1 hour) and the public URL the file will have. */
export async function createUpload(kind: UploadKind, contentType: string, size: number) {
  const spec = UPLOAD_KINDS[kind];
  const ext = (spec.types as Record<string, string>)[contentType];
  if (!ext) throw new Error(`File type ${contentType || "unknown"} isn't allowed for ${kind}s`);
  if (!Number.isFinite(size) || size <= 0 || size > spec.maxBytes) {
    throw new Error(`${kind === "video" ? "Videos" : "Images"} can be up to ${Math.round(spec.maxBytes / 1024 / 1024)} MB`);
  }

  const month = new Date().toISOString().slice(0, 7); // 2026-11
  const key = `${spec.folder}/${month}/${randomUUID()}.${ext}`;
  const uploadUrl = await getSignedUrl(
    r2(),
    new PutObjectCommand({
      Bucket: env("R2_BUCKET"),
      Key: key,
      ContentType: contentType,
      ContentLength: size,
      CacheControl: "public, max-age=31536000, immutable",
    }),
    { expiresIn: 3600 },
  );
  const publicUrl = `${env("R2_PUBLIC_URL").replace(/\/$/, "")}/${key}`;
  return { uploadUrl, publicUrl, key };
}
