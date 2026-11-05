import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import {
  BookOpen,
  Check,
  CircleHelp,
  Flame,
  Lock,
  LogIn,
  LogOut,
  LucideIcon,
  Mails,
  Pencil,
  RefreshCw,
  Settings,
  Sparkles,
  Star,
  ThumbsUp,
  Trophy,
} from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import { useAuth, UserType } from "@/context/AuthContext";
import { getUserData } from "@/lib/api/user";
import { useLogout } from "@/hooks/useLogout";
import { openRatePrompt } from "@/lib/ratePrompt";
import { AchievementStats, useCourseDatabase } from "@/lib/db/course";
import { buildAchievements } from "@/lib/achievements";
import { AchievementBadge } from "@/components/achievements/AchievementBadge";
import { Sheet } from "@/components/ds/overlays";
import { ContactDialog } from "@/components/modals/ContactDialog";
import { Fonts, PastelName, usePalette } from "@/constants/palette";
import {
  Card,
  CircleButton,
  EmptyState,
  GraphPaper,
  Group,
  GroupRow,
  IconTile,
  Loading,
  PastelCard,
  PillButton,
  ProBadge,
  ProgressBar,
  Screen,
  SectionHeader,
  T,
} from "@/components/ds";
import { CrownArt, TargetArt } from "@/components/art";

// Counts up from 0 when the number changes
const AnimatedNumber = ({ value, color, size = 30 }: { value: number; color?: string; size?: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const steps = 40;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setDisplay(Math.round(Math.min((value / steps) * step, value)));
      if (step >= steps) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <Text style={{ fontFamily: Fonts.display, fontSize: size, lineHeight: size + 4, letterSpacing: -0.6, color }}>{display.toLocaleString()}</Text>;
};

export default function ProfileScreen() {
  const c = usePalette();
  const { token, user, setUser, hydrated } = useAuth();
  const router = useRouter();
  const logout = useLogout();
  // Set while logging out, so the focus effect doesn't open /login a second time
  const loggingOutRef = useRef(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { getAchievementStats, getAverageScoreByChapter } = useCourseDatabase();

  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [averageSatScore, setAverageSatScore] = useState(0);
  const [allBadgesOpen, setAllBadgesOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stats from the local database
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const SAT_EXAMS_CHAPTER_ID = "8d3703a4-41ce-46b0-a27c-e25c0a0702e2";
        const [st, avgRes] = await Promise.all([getAchievementStats(SAT_EXAMS_CHAPTER_ID), getAverageScoreByChapter(SAT_EXAMS_CHAPTER_ID)]);
        setStats(st);
        setAverageSatScore(avgRes.success ? (avgRes.average ?? 0) : 0);
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const handleLogout = async (message = "You have logged out") => {
    loggingOutRef.current = true;
    await logout();
    router.replace("/login");
    Toast.show({ type: "success", text1: message, position: "top", visibilityTime: 700 });
  };

  // User data from the server
  useFocusEffect(
    useCallback(() => {
      // Stored token not read yet: a logged-in user would be sent to /login
      if (!hydrated) return;
      if (!token) {
        if (!loggingOutRef.current) {
          router.push({ pathname: "/login", params: { returnUrl: "/profile" } });
        }
        return;
      }
      loggingOutRef.current = false;

      const load = async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await getUserData(token);
          if (res.success) {
            // The refreshed token (if any) is saved by the background sync
            const { token: _refreshedToken, ...serverUser } = res.user;
            const mappedUser: UserType = { ...serverUser, categories: serverUser.league };
            setUser(mappedUser);
          } else if (res.status === 401 || res.status === 404) {
            // Token expired or account gone: log out instead of showing an error
            await handleLogout("Session expired, please log in again");
          } else {
            setError(res.error || "Error loading data");
          }
        } catch {
          setError("An unexpected error occurred");
        } finally {
          setLoading(false);
        }
      };
      load();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, reloadKey, hydrated])
  );

  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync("onboardingAnswers");
      if (stored) setAnswers(JSON.parse(stored));
      else setAnswers({ name: user?.name || "Student" });
    })();
  }, [user]);

  // Same rating sheet the app shows after a finished test (lib/ratePrompt)
  const handleRateUs = () => openRatePrompt("profile_button");

  if (!hydrated) return <Loading />;

  // Logged out (or back from /login without logging in)
  if (!token) {
    return <LockedProfile onLogin={() => router.push({ pathname: "/login", params: { returnUrl: "/profile" } })} />;
  }

  if (loading && !user) return <Loading />;

  if (error || !user) {
    return (
      <Screen tab contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <EmptyState icon={RefreshCw} tone="rose" title="Couldn't load your profile" text={error ?? undefined} action="Try again" onAction={() => setReloadKey((k) => k + 1)} />
        <PillButton title="Log out" tone="soft" icon={LogOut} center onPress={() => handleLogout()} />
      </Screen>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";
  const achievements = stats ? buildAchievements(stats, user.points ?? 0) : [];
  const unlocked = achievements.filter((a) => a.unlocked).length;
  // Unlocked first (newest tiers last), then the locked ones closest to done
  const featured = [...achievements]
    .sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.current / b.target - a.current / a.target)
    .slice(0, 6);

  return (
    <Screen tab>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <T variant="title">Profile</T>
        <CircleButton icon={Settings} label="Settings" onPress={() => router.push("/settings")} />
      </View>

      {/* Identity card */}
      <PastelCard tone="lav" radius={30} style={{ padding: 20, gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: "#fff", backgroundColor: c.butter, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {user.image ? (
              <Image source={{ uri: user.image }} style={{ width: "100%", height: "100%" }} />
            ) : answers["avatar"] ? (
              <Text style={{ fontSize: 32 }}>{answers["avatar"]}</Text>
            ) : (
              <Text style={{ fontFamily: Fonts.displayBold, fontSize: 24, color: c.onPastel }}>{initials}</Text>
            )}
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <T variant="h2" onPastel numberOfLines={1}>
              {user.name}
            </T>
            {!!user.email && (
              <T variant="caption" onPastel numberOfLines={1} style={{ opacity: 0.7 }}>
                {user.email}
              </T>
            )}
            {user.isPro && (
              <View style={{ marginTop: 2 }}>
                <ProBadge />
              </View>
            )}
          </View>
          <CircleButton icon={Pencil} onPastel filled size={40} label="Edit profile" onPress={() => router.push("/edit-profile")} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", backgroundColor: "#fff", borderRadius: 20, padding: 14 }}>
          <View>
            <T variant="caption" onPastel style={{ opacity: 0.6 }}>
              Total points
            </T>
            <AnimatedNumber value={user.points ?? 0} color={c.onPastel} size={32} />
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <T variant="caption" onPastel style={{ opacity: 0.6 }}>
              Achievements
            </T>
            <T style={{ fontFamily: Fonts.display, fontSize: 22 }} onPastel>
              {unlocked}/{achievements.length}
            </T>
          </View>
        </View>
      </PastelCard>

      {/* Stats */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <StatCard label="Lessons" value={stats?.lessons ?? 0} icon={BookOpen} tone="mint" />
        <StatCard label="Quizzes" value={stats?.quizzes ?? 0} icon={CircleHelp} tone="butter" />
        <StatCard label="Day streak" value={stats?.currentStreak ?? 0} icon={Flame} tone="rose" />
      </View>
      <PastelCard tone="butter" radius={26} style={{ padding: 18, flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="smallStrong" onPastel>
            Average SAT Math score
          </T>
          {averageSatScore > 0 ? (
            <AnimatedNumber value={averageSatScore} color={c.onPastel} size={40} />
          ) : (
            <>
              <T style={{ fontFamily: Fonts.display, fontSize: 26, lineHeight: 32 }} onPastel>
                No tests yet
              </T>
              <Pressable onPress={() => router.push("/tests/exams" as any)} hitSlop={8}>
                <T variant="smallStrong" onPastel style={{ textDecorationLine: "underline" }}>
                  Take a practice test
                </T>
              </Pressable>
            </>
          )}
          {averageSatScore > 0 && (
            <T variant="caption" onPastel style={{ opacity: 0.7 }}>
              out of 800
            </T>
          )}
        </View>
        <TargetArt size={84} />
      </PastelCard>

      {/* PRO */}
      {!user.isPro && (
        <PastelCard tone="mint" radius={28} onPress={() => router.push("/payment")} style={{ padding: 20, gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Sparkles size={15} color={c.onPastel} />
            <T variant="smallStrong" onPastel>
              SAT Learner PRO
            </T>
          </View>
          <T style={{ fontFamily: Fonts.display, fontSize: 24, lineHeight: 27, maxWidth: "62%" }} onPastel>
            Unlock every lesson and test
          </T>
          <PillButton title="See plans" tone="white" center onPress={() => router.push("/payment")} style={{ alignSelf: "flex-start", minHeight: 44, marginTop: 6 }} />
          <View style={{ position: "absolute", right: 12, bottom: 12 }} pointerEvents="none">
            <CrownArt size={88} />
          </View>
        </PastelCard>
      )}

      {/* Achievements */}
      <View>
        <SectionHeader title={`Achievements · ${unlocked}/${achievements.length}`} action="See all" onAction={() => setAllBadgesOpen(true)} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 }}>
          {featured.map((a) => (
            <AchievementBadge key={a.id} achievement={a} />
          ))}
        </View>
      </View>

      {/* Actions */}
      <View>
        <SectionHeader title="More" />
        <Group>
          <GroupRow icon={BookOpen} tone="mint" title="About the SAT" subtitle="Dates, scoring, what's on it" onPress={() => router.push("/info")} />
          <GroupRow icon={Mails} tone="butter" title="Contact us" onPress={() => setContactOpen(true)} />
          <GroupRow icon={ThumbsUp} tone="lav" title="Rate the app" onPress={handleRateUs} />
        </Group>
      </View>

      <ContactDialog isOpen={contactOpen} onClose={() => setContactOpen(false)} isDark={c.isDark} />

      <Sheet visible={allBadgesOpen} onClose={() => setAllBadgesOpen(false)} title="Achievements" text={`${unlocked} of ${achievements.length} unlocked`} scroll>
        <View style={{ gap: 18 }}>
          {(["Learning", "Practice", "Exams", "Habits"] as const).map((g) => (
            <View key={g} style={{ gap: 10 }}>
              <T variant="label">{g}</T>
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 }}>
                {achievements
                  .filter((a) => a.group === g)
                  .map((a) => (
                    <AchievementBadge key={a.id} achievement={a} />
                  ))}
              </View>
            </View>
          ))}
        </View>
      </Sheet>
    </Screen>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: number; icon: LucideIcon; tone: PastelName }) {
  const c = usePalette();
  return (
    <Card style={{ flex: 1, gap: 12, padding: 14 }}>
      <IconTile icon={icon} tone={tone} size={36} radius={12} />
      <View>
        <AnimatedNumber value={value} color={c.ink} size={26} />
        <T variant="caption">{label}</T>
      </View>
    </Card>
  );
}

// Logged out: what the profile holds, and a way in
function LockedProfile({ onLogin }: { onLogin: () => void }) {
  const c = usePalette();
  return (
    <Screen tab>
      <T variant="title">Profile</T>
      <PastelCard tone="lav" radius={30} style={{ padding: 22, gap: 12, minHeight: 260 }}>
        <View style={{ position: "absolute", right: 14, top: 16 }} pointerEvents="none">
          <TargetArt size={96} />
        </View>
        <T variant="smallStrong" onPastel>
          Not logged in
        </T>
        <T style={{ fontFamily: Fonts.display, fontSize: 30, lineHeight: 32, letterSpacing: -0.6, maxWidth: "62%" }} onPastel>
          Keep your progress safe
        </T>
        <T variant="small" onPastel style={{ maxWidth: "80%" }}>
          Log in to save points, scores and achievements, and to pick up on another phone.
        </T>
        <PillButton title="Log in or sign up" tone="white" icon={LogIn} onPress={onLogin} style={{ marginTop: "auto" }} />
      </PastelCard>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {[
          { icon: Trophy, label: "Points", tone: "butter" as const },
          { icon: BookOpen, label: "Lessons", tone: "mint" as const },
          { icon: Star, label: "Badges", tone: "rose" as const },
        ].map((x) => (
          <Card key={x.label} style={{ flex: 1, alignItems: "center", gap: 10, paddingVertical: 18 }}>
            <IconTile icon={x.icon} tone={x.tone} size={40} radius={20} />
            <T variant="caption" color={c.muted}>
              {x.label}
            </T>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
