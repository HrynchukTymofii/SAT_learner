import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/getAuth";
import { getUserIdFromRequest } from "@/lib/expo-auth";
import { AUDIENCES, Audience, createAndSend } from "@/lib/notifications";

/**
 * Admins only: a website session or app token of a user with role "admin",
 * or `Authorization: Bearer <NOTIFICATIONS_ADMIN_KEY>` for scripts.
 */
async function isAdmin(req: NextRequest) {
  const key = process.env.NOTIFICATIONS_ADMIN_KEY;
  const header = req.headers.get("authorization");
  if (key && key.length >= 24 && header === `Bearer ${key}`) return true;
  const session = await auth();
  const userId = session.userId ?? getUserIdFromRequest(req);
  if (!userId) return false;
  const u = await db.user.findUnique({ where: { userId }, select: { role: true } });
  return u?.role === "admin";
}

/** Send: { title, body, url?, audience: "all"|"pro"|"free"|"user", userId? (or email), push?: boolean } */
export async function POST(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const body = typeof b.body === "string" ? b.body.trim() : "";
  const audience: Audience = AUDIENCES.includes(b.audience) ? b.audience : "all";
  if (!title || !body || title.length > 120 || body.length > 1000) {
    return NextResponse.json({ error: "Title (max 120) and body (max 1000) are required" }, { status: 400 });
  }
  let userId: string | null = null;
  if (audience === "user") {
    const u = b.userId
      ? await db.user.findUnique({ where: { userId: String(b.userId) }, select: { userId: true } })
      : b.email
        ? await db.user.findFirst({ where: { email: String(b.email).toLowerCase().trim() }, select: { userId: true } })
        : null;
    if (!u) return NextResponse.json({ error: "User not found" }, { status: 404 });
    userId = u.userId;
  }
  // In-app links only (paths like /tests/exams), never outside URLs
  const url = typeof b.url === "string" && b.url.startsWith("/") && !b.url.startsWith("//") ? b.url : null;
  const n = await createAndSend({ title, body, url, audience, userId, push: b.push !== false });
  return NextResponse.json({ success: true, notification: n });
}

/** History for the admin page. */
export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const items = await db.notification.findMany({ orderBy: { createdAt: "desc" }, take: 50, include: { _count: { select: { reads: true } } } });
  return NextResponse.json({ notifications: items });
}
