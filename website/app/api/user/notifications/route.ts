import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/expo-auth";
import { visibleTo } from "@/lib/notifications";

/**
 * Inbox for the app: the latest 50 notifications this person may see.
 * Logged in: `read` comes from the server. Logged out: only "all" ones, and the app keeps read state on the phone.
 */
export async function GET(req: NextRequest) {
  const userId = getUserIdFromRequest(req);
  const user = userId ? await db.user.findUnique({ where: { userId }, select: { userId: true, isPro: true } }) : null;
  if (userId && !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await db.notification.findMany({
    where: visibleTo(user),
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      body: true,
      url: true,
      createdAt: true,
      reads: user ? { where: { userId: user.userId }, select: { readAt: true } } : false,
    },
  });

  return NextResponse.json({
    notifications: items.map(({ reads, ...n }) => ({ ...n, read: user ? (reads?.length ?? 0) > 0 : false })),
  });
}
