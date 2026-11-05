import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type Audience = "all" | "pro" | "free" | "user";
export const AUDIENCES: Audience[] = ["all", "pro", "free", "user"];

/** Notifications a person may see: everyone's, their plan's (pro/free) and their own. */
export function visibleTo(user: { userId: string; isPro: boolean } | null): Prisma.NotificationWhereInput {
  if (!user) return { audience: "all" };
  return {
    OR: [
      { audience: "all" },
      { audience: user.isPro ? "pro" : "free" },
      { audience: "user", userId: user.userId },
    ],
  };
}

/** Which phones a notification goes to. */
async function tokensFor(audience: Audience, userId?: string | null): Promise<string[]> {
  const where: Prisma.PushTokenWhereInput =
    audience === "all"
      ? {}
      : audience === "user"
        ? { userId: userId ?? "__none__" }
        : { user: { isPro: audience === "pro" } };
  const rows = await db.pushToken.findMany({ where, select: { token: true } });
  return rows.map((r) => r.token);
}

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Sends through Expo's push service in batches of 100 and removes tokens Expo says are dead.
 * Returns how many pushes Expo accepted.
 */
async function sendExpoPush(tokens: string[], msg: { title: string; body: string; data: Record<string, unknown> }) {
  let accepted = 0;
  const dead: string[] = [];
  for (let i = 0; i < tokens.length; i += 100) {
    const batch = tokens.slice(i, i + 100);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(process.env.EXPO_ACCESS_TOKEN ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` } : {}),
        },
        body: JSON.stringify(batch.map((to) => ({ to, sound: "default", title: msg.title, body: msg.body, data: msg.data }))),
      });
      const json = (await res.json().catch(() => null)) as { data?: { status: string; details?: { error?: string } }[] } | null;
      json?.data?.forEach((ticket, k) => {
        if (ticket.status === "ok") accepted++;
        else if (ticket.details?.error === "DeviceNotRegistered") dead.push(batch[k]);
      });
    } catch (err) {
      console.error("Expo push batch failed:", err);
    }
  }
  if (dead.length) await db.pushToken.deleteMany({ where: { token: { in: dead } } });
  return accepted;
}

/** Saves the notification for the in-app inbox and pushes it to the matching phones. */
export async function createAndSend(input: { title: string; body: string; url?: string | null; audience: Audience; userId?: string | null; push?: boolean }) {
  const n = await db.notification.create({
    data: {
      title: input.title,
      body: input.body,
      url: input.url || null,
      audience: input.audience,
      userId: input.audience === "user" ? input.userId ?? null : null,
    },
  });
  let pushCount = 0;
  if (input.push !== false) {
    const tokens = await tokensFor(input.audience, input.userId);
    pushCount = await sendExpoPush(tokens, { title: n.title, body: n.body, data: { type: "inbox", notificationId: n.id, url: n.url } });
    await db.notification.update({ where: { id: n.id }, data: { pushCount } });
  }
  return { ...n, pushCount };
}
