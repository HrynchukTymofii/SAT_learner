import { NextRequest, NextResponse } from "next/server";
import { getAppContent } from "@/lib/app-content";

/**
 * GET /api/user/course/content?since=<version>
 * All published course content for the mobile app's local copy (see lib/app-content.ts).
 * If `since` matches the current version, only { version, unchanged: true } is sent.
 * Cached on Vercel's edge for a minute, so admin edits reach the app within about a minute.
 */
export async function GET(req: NextRequest) {
  try {
    const content = await getAppContent();
    const since = req.nextUrl.searchParams.get("since");
    const body = since === content.version ? { version: content.version, unchanged: true } : content;
    return NextResponse.json(body, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("❌ Failed to build app content:", err);
    return NextResponse.json({ error: "Failed to load course content" }, { status: 500 });
  }
}
