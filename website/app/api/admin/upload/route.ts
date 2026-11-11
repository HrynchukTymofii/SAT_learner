import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin";
import { createUpload, UPLOAD_KINDS, UploadKind } from "@/lib/r2";

/** Admins only. Body: { kind: "image" | "video", contentType, size } → { uploadUrl, publicUrl } */
export async function POST(req: NextRequest) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const b = await req.json().catch(() => ({}));
  const kind = b.kind as UploadKind;
  if (!(kind in UPLOAD_KINDS)) return NextResponse.json({ error: "Unknown upload kind" }, { status: 400 });

  try {
    const { uploadUrl, publicUrl } = await createUpload(kind, String(b.contentType || ""), Number(b.size));
    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    // Missing env vars are a server problem, everything else is a bad file
    const status = message.endsWith("is not set") ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
