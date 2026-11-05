/**
 * Notification inbox: messages sent from the website admin page (website/app/api/admin/notifications).
 * The bell on Home opens it. Pushes come through Expo; the same message is always in the inbox too.
 */
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import api from "./axios";

export interface InboxItem {
  id: string;
  title: string;
  body: string;
  url: string | null;
  createdAt: string;
  read: boolean;
}

const LOCAL_READ_KEY = "inboxReadIds"; // logged out: read state is kept on the phone
const PUSH_TOKEN_KEY = "expoPushToken";

const auth = (token: string | null) => (token ? { Authorization: `Bearer ${token}` } : {});

async function localReadIds(): Promise<Set<string>> {
  try {
    return new Set(JSON.parse((await SecureStore.getItemAsync(LOCAL_READ_KEY)) || "[]"));
  } catch {
    return new Set();
  }
}

async function saveLocalReadIds(ids: Set<string>) {
  try {
    // keep the newest few hundred so the stored value stays small
    await SecureStore.setItemAsync(LOCAL_READ_KEY, JSON.stringify([...ids].slice(-300)));
  } catch {}
}

export async function fetchInbox(token: string | null): Promise<InboxItem[]> {
  const res = await api.get("/user/notifications", { headers: auth(token) });
  const items: InboxItem[] = res.data?.notifications ?? [];
  if (token) return items;
  const read = await localReadIds();
  return items.map((n) => ({ ...n, read: read.has(n.id) }));
}

export async function markInboxRead(token: string | null, ids: string[]) {
  if (!ids.length) return;
  if (token) {
    await api.post("/user/notifications/read", { ids }, { headers: auth(token) }).catch(() => {});
  } else {
    const read = await localReadIds();
    ids.forEach((id) => read.add(id));
    await saveLocalReadIds(read);
  }
}

/** Unread count for the bell. Refreshes when `refreshKey` changes (e.g. on screen focus). */
export function useUnreadCount(token: string | null, refreshKey: unknown) {
  const [count, setCount] = useState(0);
  const load = useCallback(async () => {
    try {
      const items = await fetchInbox(token);
      setCount(items.filter((n) => !n.read).length);
    } catch {
      // offline: keep the last count
    }
  }, [token]);
  useEffect(() => {
    load();
  }, [load, refreshKey]);
  return count;
}

/**
 * Registers this phone for pushes and links it to the logged-in account (if any).
 * Uses the permission the daily reminder already asks for; does nothing if it was refused.
 */
export async function registerPushToken(authToken: string | null) {
  if (Platform.OS === "web") return;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;
    const projectId = (Constants.expoConfig?.extra as any)?.eas?.projectId ?? (Constants as any).easConfig?.projectId;
    const { data: pushToken } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    await api.post("/user/push-token", { token: pushToken, platform: Platform.OS }, { headers: auth(authToken) });
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, pushToken);
  } catch (e) {
    console.warn("Push token not registered", e);
  }
}

/** On logout: this phone stops getting the account's personal pushes. */
export async function unlinkPushToken() {
  try {
    const pushToken = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
    if (pushToken) await api.delete("/user/push-token", { data: { token: pushToken } });
  } catch {}
}
