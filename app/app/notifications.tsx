import { useCallback, useState } from "react";
import { RefreshControl, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Bell, BellOff, ChevronRight, WifiOff } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { fetchInbox, InboxItem, markInboxRead } from "@/lib/inbox";
import { usePalette } from "@/constants/palette";
import { EmptyState, LinkButton, Loading, Screen, T, Tap, TopBar } from "@/components/ds";

const timeAgo = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

/** Inbox for notifications sent from the website admin page. Opening it marks everything read. */
export default function NotificationsScreen() {
  const c = usePalette();
  const router = useRouter();
  const { token } = useAuth();
  const [items, setItems] = useState<InboxItem[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await fetchInbox(token);
      setItems(list);
      setError(false);
      // Seen now; the dots stay for this visit so you can tell what's new
      const unread = list.filter((n) => !n.read).map((n) => n.id);
      markInboxRead(token, unread);
    } catch {
      setError(true);
      setItems((prev) => prev ?? []);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (items === null) return <Loading />;

  return (
    <Screen
      header={<TopBar title="Notifications" />}
      scrollProps={{ refreshControl: <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.brand} /> }}
    >
      {error && items.length === 0 ? (
        <EmptyState icon={WifiOff} tone="rose" title="You're offline" text="Connect to the internet to see your notifications." action="Try again" onAction={refresh} />
      ) : items.length === 0 ? (
        <EmptyState icon={BellOff} title="Nothing here yet" text="News, new exams and tips from the SAT Learner team will show up here." />
      ) : (
        <View style={{ gap: 10 }}>
          {items.map((n) => {
            const content = (
              <>
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: n.read ? c.surface2 : c.lav, alignItems: "center", justifyContent: "center" }}>
                  <Bell size={19} color={n.read ? c.muted : c.onPastel} strokeWidth={1.9} />
                </View>
                <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <T variant="bodyStrong" style={{ flex: 1 }} numberOfLines={2}>
                      {n.title}
                    </T>
                    {!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.brand }} />}
                  </View>
                  <T variant="small" style={{ color: c.muted }}>
                    {n.body}
                  </T>
                  <T variant="caption" color={c.subtle} style={{ marginTop: 2 }}>
                    {timeAgo(n.createdAt)}
                  </T>
                </View>
                {!!n.url && <ChevronRight size={18} color={c.subtle} style={{ alignSelf: "center" }} />}
              </>
            );
            const box = {
              flexDirection: "row" as const,
              gap: 12,
              padding: 14,
              borderRadius: 22,
              backgroundColor: c.surface,
              borderWidth: 1,
              borderColor: n.read ? c.line : c.lav2,
            };
            return n.url ? (
              <Tap key={n.id} onPress={() => router.push(n.url as any)} style={({ pressed }) => [box, { opacity: pressed ? 0.85 : 1 }]}>
                {content}
              </Tap>
            ) : (
              <View key={n.id} style={box}>
                {content}
              </View>
            );
          })}
        </View>
      )}
      {!token && items.length > 0 && (
        <View style={{ alignItems: "center", gap: 4 }}>
          <T variant="caption" style={{ textAlign: "center" }}>
            Log in to also get messages meant just for you.
          </T>
          <LinkButton title="Log in" onPress={() => router.push("/login")} />
        </View>
      )}
    </Screen>
  );
}
