import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/expo-auth";

// Expo push tokens look like ExponentPushToken[xxxx] (or ExpoPushToken[xxxx])
const isExpoToken = (t: unknown): t is string => typeof t === "string" && /^Expo(nent)?PushToken\[.+\]$/.test(t);

/**
 * The app registers its push token on start. Works logged out too (so "all" pushes reach everyone);
 * with a Bearer token the phone is linked to that account.
 */
export async function POST(req: NextRequest) {
  const { token, platform } = await req.json().catch(() => ({}));
  if (!isExpoToken(token)) return NextResponse.json({ error: "Invalid push token" }, { status: 400 });
  const userId = getUserIdFromRequest(req);
  if (userId && !(await db.user.findUnique({ where: { userId }, select: { userId: true } }))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await db.pushToken.upsert({
    where: { token },
    create: { token, platform: typeof platform === "string" ? platform : null, userId },
    update: { platform: typeof platform === "string" ? platform : undefined, userId },
  });
  return NextResponse.json({ success: true });
}

/** On logout: the phone keeps getting "all" pushes but is unlinked from the account. */
export async function DELETE(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}));
  if (!isExpoToken(token)) return NextResponse.json({ error: "Invalid push token" }, { status: 400 });
  await db.pushToken.updateMany({ where: { token }, data: { userId: null } });
  return NextResponse.json({ success: true });
}
