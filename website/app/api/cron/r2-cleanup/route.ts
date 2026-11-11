import { NextRequest, NextResponse } from "next/server";
import { cleanupR2 } from "@/lib/r2-cleanup";

// Weekly (vercel.json): deletes R2 files nothing links to any more. See lib/r2-cleanup.ts.
// Vercel Cron sends "Authorization: Bearer <CRON_SECRET>". Add ?dry=1 to only list what would go.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dryRun = req.nextUrl.searchParams.get("dry") === "1";
  try {
    const summary = await cleanupR2({ dryRun });
    console.log("[r2-cleanup]", JSON.stringify({ ...summary, unused: summary.unused.slice(0, 50) }));
    return NextResponse.json(summary);
  } catch (e) {
    console.error("[r2-cleanup] failed", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Cleanup failed" }, { status: 500 });
  }
}
