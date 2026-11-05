import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { ArrowRight, Bell, BookOpen, Calendar, Check, Play, Plus, Sparkles, Timer } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@/context/AuthContext";
import { useUnreadCount } from "@/lib/inbox";
import { useCourseDatabase } from "@/lib/db/course";
import {
  formatDateKey,
  getDefaultPlanSuggestion,
  getStudyPlan,
  getTaskCount,
  saveStudyPlan,
  Task as StudyTask,
} from "@/lib/studyPlanStorage";
import { useTour } from "@/context/TourContext";
import { TourTooltip } from "@/components/Tour/TourTooltip";
import { getTourStepInfo, TOTAL_TOUR_STEPS, TOUR_STEPS } from "@/constants/tourSteps";
import { Fonts, PASTEL_CYCLE, usePalette } from "@/constants/palette";
import {
  Card,
  Chip,
  GUTTER,
  IconTile,
  LinkButton,
  PastelCard,
  PillButton,
  ProBadge,
  ProgressBar,
  Screen,
  SectionHeader,
  T, Tap
} from "@/components/ds";
import { CrownArt, SlopeArt, StopwatchArt } from "@/components/art";

/**
 * Home tab: greeting, the chapter to continue, practice exam, this week's plan and today's tasks.
 */

interface RecentChapter {
  id: string;
  title: string;
  progress: number;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  type: "lesson" | "quiz" | "review" | null;
}

const toTasks = (tasks: StudyTask[]): Task[] =>
  tasks.map((t) => ({ id: t.id, title: t.text, completed: t.completed, type: t.type || "lesson" }));

const sameDay = (a: Date, b: Date) =>
  a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

// Sunday..Saturday of the current week
const currentWeek = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

const daysUntil = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
};

export default function HomeScreen() {
  const c = usePalette();
  const { user, token } = useAuth();
  const [focusTick, setFocusTick] = useState(0);
  const unread = useUnreadCount(token, focusTick);
  const { getRecentChapters } = useCourseDatabase();
  const { tourActive, currentStep, setCurrentStep, endTour, skipTour } = useTour();

  const [recentChapters, setRecentChapters] = useState<RecentChapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [hasCustomPlan, setHasCustomPlan] = useState(false);
  const [satDate, setSatDate] = useState<string | null>(null);
  const [weekTaskCounts, setWeekTaskCounts] = useState<Map<string, number>>(new Map());

  const week = currentWeek();

  // The tour walks through the tabs
  useEffect(() => {
    if (tourActive && currentStep === TOUR_STEPS.TESTS_TAB) {
      setTimeout(() => router.push("/(tabs)/tests"), 100);
    } else if (tourActive && currentStep === TOUR_STEPS.COURSE_TAB) {
      setTimeout(() => router.push("/(tabs)/course"), 100);
    }
  }, [tourActive, currentStep]);

  const handleTourNext = () => {
    if (currentStep === TOTAL_TOUR_STEPS - 1) endTour();
    else setCurrentStep(currentStep + 1);
  };
  const handleTourPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  useFocusEffect(
    useCallback(() => {
      loadRecentChapters();
      loadTodayPlan();
      loadSatDate();
      loadWeekTaskCounts();
      setFocusTick((t) => t + 1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const loadRecentChapters = async () => {
    setLoadingChapters(true);
    const result = await getRecentChapters();
    if (result.success && result.chapters) {
      setRecentChapters(result.chapters.map((ch) => ({ id: ch.id, title: ch.title, progress: ch.progress })));
    }
    setLoadingChapters(false);
  };

  const loadTodayPlan = async () => {
    try {
      const plan = await getStudyPlan(new Date());
      if (plan && plan.tasks && plan.tasks.length > 0) {
        setHasCustomPlan(true);
        setTodayTasks(toTasks(plan.tasks));
      } else {
        setHasCustomPlan(false);
        setTodayTasks(toTasks(getDefaultPlanSuggestion()));
      }
    } catch (error) {
      console.error("Failed to load today's plan:", error);
      setHasCustomPlan(false);
      setTodayTasks(toTasks(getDefaultPlanSuggestion()));
    }
  };

  const loadSatDate = async () => {
    try {
      const stored = await SecureStore.getItemAsync("onboardingAnswers");
      if (stored) setSatDate(JSON.parse(stored).satDate || null);
    } catch (error) {
      console.error("Failed to load SAT date:", error);
    }
  };

  const loadWeekTaskCounts = async () => {
    try {
      const counts = new Map<string, number>();
      for (const date of currentWeek()) {
        const key = formatDateKey(date);
        counts.set(key, (await getTaskCount(key)).total);
      }
      setWeekTaskCounts(counts);
    } catch (error) {
      console.error("Failed to load week task counts:", error);
    }
  };

  const toggleTask = async (taskId: string) => {
    const updated = todayTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setTodayTasks(updated);
    try {
      const today = new Date();
      const plan = await getStudyPlan(today);
      await saveStudyPlan(today, {
        goals: plan?.goals || "",
        tasks: updated.map((t) => ({ id: t.id, text: t.title, completed: t.completed, type: t.type })),
      });
      // A default plan becomes the user's own once they tick something
      if (!hasCustomPlan) setHasCustomPlan(true);
    } catch (error) {
      console.error("Failed to save task update:", error);
    }
  };

  const openToday = () => router.push(`/calendar/day/${formatDateKey(new Date())}` as any);

  const done = todayTasks.filter((t) => t.completed).length;
  const firstName = user?.name?.trim().split(" ")[0];
  const satIn = satDate ? daysUntil(satDate) : null;
  const main = recentChapters[0];
  const introInfo = getTourStepInfo(TOUR_STEPS.TOUR_INTRO);

  return (
    <Screen tab>
      {/* Greeting */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1, gap: 3 }}>
          <T variant="h2" style={{ fontSize: 19 }}>
            {firstName ? `Hi, ${firstName}` : "Hi there"}
          </T>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {user?.isPro && <ProBadge />}
            <T variant="small">
              {user ? `${(user.points ?? 0).toLocaleString()} points` : "Log in to save your progress"}
            </T>
          </View>
        </View>
        {/* Inbox: notifications sent from the website admin page */}
        <Tap
          onPress={() => router.push("/notifications" as any)}
          accessibilityLabel={unread > 0 ? `Notifications, ${unread} new` : "Notifications"}
          hitSlop={6}
          style={({ pressed }) => ({
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: c.surface,
            borderWidth: 1.5,
            borderColor: c.line,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Bell size={21} color={c.ink} strokeWidth={1.9} />
          {unread > 0 && (
            <View
              style={{
                position: "absolute",
                top: 6,
                right: 5,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                paddingHorizontal: 4,
                backgroundColor: c.danger,
                borderWidth: 2,
                borderColor: c.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <T style={{ fontFamily: Fonts.bodyHeavy, fontSize: 9.5, lineHeight: 12 }} color="#fff">
                {unread > 9 ? "9+" : unread}
              </T>
            </View>
          )}
        </Tap>
      </View>

      <T variant="hero" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        Let's crack some math.
      </T>

      {/* Quick chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -GUTTER }}
        contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 8 }}
      >
        {satIn != null && satIn >= 0 && (
          <Chip label={satIn === 0 ? "SAT is today" : `SAT in ${satIn} day${satIn === 1 ? "" : "s"}`} tone="butter" icon={Calendar} onPress={() => router.push("/calendar" as any)} />
        )}
        <Chip label="Course" tone="mint" icon={BookOpen} onPress={() => router.push("/(tabs)/course")} />
        <Chip label="Practice exam" tone="lav" icon={Timer} onPress={() => router.push("/tests/exams" as any)} />
        <Chip label="Planner" icon={Calendar} onPress={() => router.push("/calendar" as any)} />
      </ScrollView>

      {/* Continue card */}
      <PastelCard tone="butter" radius={30} style={{ width: "100%", minHeight: 236, padding: 20, gap: 10 }}>
        <T variant="smallStrong" onPastel>
          {main ? "Continue where you left off" : "Start here"}
        </T>
        <T style={{ fontFamily: Fonts.display, fontSize: 30, lineHeight: 31, letterSpacing: -0.7, paddingRight: 140 }} onPastel numberOfLines={3}>
          {loadingChapters ? " " : main ? main.title : "SAT Math course"}
        </T>
        {main ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ProgressBar value={main.progress} onPastel style={{ width: 110 }} />
            <T variant="smallStrong" onPastel>
              {main.progress}%
            </T>
          </View>
        ) : (
          <T variant="small" onPastel style={{ paddingRight: 150 }}>
            Short lessons, then a quiz for each topic.
          </T>
        )}
        <View style={{ position: "absolute", right: 4, top: 40 }} pointerEvents="none">
          <SlopeArt />
        </View>
        <PillButton
          tone="white"
          title={main ? "Continue chapter" : "Open the course"}
          icon={Play}
          onPress={() => router.push(main ? (`/course/${main.id}` as any) : "/(tabs)/course")}
          style={{ marginTop: "auto" }}
        />
      </PastelCard>

      {/* Other recent chapters */}
      {recentChapters.length > 1 && (
        <View>
          <SectionHeader title="Recent chapters" action="All chapters" onAction={() => router.push("/(tabs)/course")} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -GUTTER, flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: GUTTER, gap: 12, alignItems: "flex-start" }}
          >
            {recentChapters.slice(1).map((ch, i) => (
              // Fixed height + its own bottom padding, so the progress bar can't be pushed
              // against (and clipped by) the card's rounded bottom edge on phones
              <PastelCard
                key={ch.id}
                tone={PASTEL_CYCLE[(i + 1) % PASTEL_CYCLE.length]}
                radius={24}
                onPress={() => router.push(`/course/${ch.id}` as any)}
                style={{ width: 200, height: 176, paddingTop: 14, paddingHorizontal: 16, paddingBottom: 18, justifyContent: "space-between" }}
              >
                <View>
                  <IconTile icon={BookOpen} tone="white" size={40} radius={20} />
                  <T variant="bodyStrong" onPastel numberOfLines={2} style={{ marginTop: 12 }}>
                    {ch.title}
                  </T>
                </View>
                <View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                    <T variant="caption" onPastel>
                      Progress
                    </T>
                    <T variant="smallStrong" onPastel style={{ fontSize: 12 }}>
                      {ch.progress}%
                    </T>
                  </View>
                  <ProgressBar value={ch.progress} onPastel track="rgba(11,10,15,0.12)" style={{ width: "100%" }} />
                </View>
              </PastelCard>
            ))}
          </ScrollView>
        </View>
      )}

      {/* This week */}
      <View>
        <SectionHeader title="This week" action="Planner" onAction={() => router.push("/calendar" as any)} />
        <Card style={{ padding: 8 }}>
          <View style={{ flexDirection: "row" }}>
            {week.map((date) => {
              const key = formatDateKey(date);
              const today = sameDay(date, new Date());
              const isSat = !!satDate && sameDay(date, new Date(satDate));
              const count = weekTaskCounts.get(key) || 0;
              const bg = today ? c.inkButton : isSat ? c.butter : "transparent";
              const fg = today ? c.inkButtonText : isSat ? c.onPastel : c.ink;
              return (
                <Tap
                  key={key}
                  onPress={() => router.push(`/calendar/day/${key}` as any)}
                  style={({ pressed }) => ({
                    flex: 1,
                    alignItems: "center",
                    gap: 6,
                    paddingTop: 9,
                    paddingBottom: 13,
                    borderRadius: 999,
                    backgroundColor: bg,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <T variant="caption" color={today ? c.inkButtonText : isSat ? c.onPastel : c.muted} style={{ fontSize: 11.5, opacity: today ? 0.75 : 1 }}>
                    {isSat ? "SAT" : date.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2)}
                  </T>
                  <T variant="bodyStrong" color={fg}>
                    {date.getDate()}
                  </T>
                  <View
                    style={{
                      position: "absolute",
                      bottom: 5,
                      width: 5,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: count > 0 ? (today ? c.lav : c.lav2) : "transparent",
                    }}
                  />
                </Tap>
              );
            })}
          </View>
        </Card>
      </View>

      {/* Tour intro dialog */}
      {tourActive && currentStep === TOUR_STEPS.TOUR_INTRO && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <TourTooltip
            visible
            onNext={handleTourNext}
            onPrev={handleTourPrev}
            onSkip={skipTour}
            onClose={() => {}}
            title={introInfo.title}
            content={introInfo.content}
            stepNumber={TOUR_STEPS.TOUR_INTRO + 1}
            totalSteps={TOTAL_TOUR_STEPS}
            placement="center"
            nextButtonText="Let's Go!"
            skipButtonText="No Thanks"
            showSkipButton
            delayMs={600}
          >
            <View style={{ width: 1, height: 1 }} />
          </TourTooltip>
        </View>
      )}

      {/* Today's plan */}
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <T variant="h2">Today's plan</T>
          <LinkButton title={hasCustomPlan ? "Edit" : "Make my own"} onPress={openToday} />
        </View>
        <T variant="small" style={{ marginBottom: 12 }}>
          {hasCustomPlan
            ? `${done} of ${todayTasks.length} done`
            : "A suggested plan. Tick a task or make your own."}
        </T>
        <View style={{ gap: 10 }}>
          {todayTasks.map((task) => (
            <Tap
              key={task.id}
              onPress={() => toggleTask(task.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: task.completed }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderRadius: 20,
                backgroundColor: task.completed ? c.mint : c.surface,
                borderWidth: 1,
                borderColor: task.completed ? "transparent" : c.line,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  borderWidth: task.completed ? 0 : 1.5,
                  borderColor: c.line,
                  backgroundColor: task.completed ? c.onPastel : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {task.completed && <Check size={16} color="#fff" strokeWidth={3} />}
              </View>
              <T
                variant="bodyStrong"
                color={task.completed ? c.onPastel : c.ink}
                style={{ flex: 1, fontSize: 14.5, textDecorationLine: task.completed ? "line-through" : "none" }}
              >
                {task.title}
              </T>
              <T variant="caption" color={task.completed ? c.onPastel : c.muted}>
                {task.type === "quiz" ? "Quiz" : task.type === "review" ? "Review" : "Lesson"}
              </T>
            </Tap>
          ))}
          <Tap
            onPress={openToday}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: 14,
              borderRadius: 20,
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: c.line,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Plus size={17} color={c.muted} />
            <T variant="smallStrong" color={c.muted}>
              Add a task
            </T>
          </Tap>
        </View>
      </View>

      {/* Practice exam */}
      <PastelCard tone="lav" radius={28} onPress={() => router.push("/tests/exams" as any)} style={PROMO}>
        <T variant="smallStrong" onPastel>
          Practice exam · 44 questions · 70 min
        </T>
        <T style={{ fontFamily: Fonts.display, fontSize: 26, lineHeight: 29, letterSpacing: -0.5, paddingRight: ART_ROOM }} onPastel>
          Full SAT Math section
        </T>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: "auto", paddingTop: 6 }}>
          <T variant="bodyStrong" onPastel>
            Start a test
          </T>
          <ArrowRight size={18} color={c.onPastel} />
        </View>
        <View style={{ position: "absolute", right: 14, bottom: 14 }} pointerEvents="none">
          <StopwatchArt size={104} />
        </View>
      </PastelCard>

      {/* PRO */}
      {user && !user.isPro && (
        <PastelCard tone="mint" radius={28} onPress={() => router.push("/payment")} style={PROMO}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Sparkles size={15} color={c.onPastel} />
            <T variant="smallStrong" onPastel>
              SAT Learner PRO
            </T>
          </View>
          <T style={{ fontFamily: Fonts.display, fontSize: 24, lineHeight: 28, letterSpacing: -0.4, paddingRight: ART_ROOM }} onPastel>
            Every lesson, every test, no limits
          </T>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: "auto", paddingTop: 6 }}>
            <T variant="bodyStrong" onPastel>
              See plans
            </T>
            <ArrowRight size={18} color={c.onPastel} />
          </View>
          <View style={{ position: "absolute", right: 14, bottom: 14 }} pointerEvents="none">
            <CrownArt size={100} />
          </View>
        </PastelCard>
      )}
    </Screen>
  );
}

// Bottom promo cards: full width and tall enough for the drawing on the right
const ART_ROOM = 112;
const PROMO = { width: "100%", minHeight: 172, padding: 20, gap: 8, justifyContent: "flex-start" } as const;
