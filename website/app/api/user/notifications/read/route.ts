import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/expo-auth";
import { visibleTo } from "@/lib/notifications";

/** Mark notifications as read: { ids: string[] } or { all: true }. */
export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  const user = await db.user.findUnique({ where: { userId: auth.userId }, select: { userId: true, isPro: true } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const ids: string[] = Array.isArray(body.ids) ? body.ids.filter((x: unknown) => typeof x === "string").slice(0, 200) : [];
  // Only ones this user can actually see
  const visible = await db.notification.findMany({
    where: body.all ? visibleTo(user) : { AND: [visibleTo(user), { id: { in: ids } }] },
    select: { id: true },
    take: 200,
    orderBy: { createdAt: "desc" },
  });
  if (visible.length) {
    await db.notificationRead.createMany({
      data: visible.map((n) => ({ userId: user.userId, notificationId: n.id })),
      skipDuplicates: true,
    });
  }
  return NextResponse.json({ success: true, marked: visible.length });
}
