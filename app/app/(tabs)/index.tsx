import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  CheckCircle2,
  Circle,
  Calendar,
  Edit3,
} from "lucide-react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useCourseDatabase } from "@/lib/db/course";
import {
  getStudyPlan,
  getDefaultPlanSuggestion,
  saveStudyPlan,
  formatDateKey,
  getTaskCount,
  Task as StudyTask,
} from "@/lib/studyPlanStorage";
import * as SecureStore from "expo-secure-store";
import { useTour } from "@/context/TourContext";
import { TourTooltip } from "@/components/Tour/TourTooltip";
import {
  TOUR_STEPS,
  TOTAL_TOUR_STEPS,
  getTourStepInfo,
} from "@/constants/tourSteps";

/**
 * ExploreScreen (Index/Home Tab)
 *
 * This is the main landing screen that displays:
 * - User's study plan for the day with task tracking
 * - Recent chapters with progress indicators
 * - SAT date countdown
 * - Weekly task overview calendar
 * - Tour tooltip for STUDY_PLAN step
 *
 * Features:
 * - Dynamic theme support (dark/light mode)
 * - Loads data on focus using useFocusEffect
 * - Integrates with tour system for onboarding
 * - Displays personalized study recommendations
 */

interface RecentChapter {
  id: string;
  title: string;
  progress: number;
  color: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  type: "lesson" | "quiz" | "review" | null;
}

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { getRecentChapters } = useCourseDatabase();

  // Tour
  const { tourActive, currentStep, setCurrentStep, endTour, skipTour } =
    useTour();

  // State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recentChapters, setRecentChapters] = useState<RecentChapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [hasCustomPlan, setHasCustomPlan] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [satDate, setSatDate] = useState<string | null>(null);
  const [weekTaskCounts, setWeekTaskCounts] = useState<Map<string, number>>(
    new Map()
  );

  // Tour navigation
  React.useEffect(() => {
    if (tourActive && currentStep === TOUR_STEPS.TESTS_TAB) {
      // Navigate to tests tab
      setTimeout(() => {
        router.push("/(tabs)/tests");
      }, 100);
    } else if (tourActive && currentStep === TOUR_STEPS.COURSE_TAB) {
      // Navigate to course tab
      setTimeout(() => {
        router.push("/(tabs)/course");
      }, 100);
    }
  }, [tourActive, currentStep]);

  const handleTourNext = () => {
    if (currentStep === TOTAL_TOUR_STEPS - 1) {
      endTour();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleTourPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
    
  };

  // Load recent chapters and study plan on page focus
  useFocusEffect(
    useCallback(() => {
      loadRecentChapters();
      loadTodayPlan();
      loadSatDate();
      loadWeekTaskCounts();
    }, [])
  );

  const loadRecentChapters = async () => {
    setIsLoadingChapters(true);
    const result = await getRecentChapters();
    if (result.success && result.chapters) {
      // Assign colors to chapters
      const colors = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];
      const chaptersWithColors = result.chapters.map((chapter, index) => ({
        id: chapter.id,
        title: chapter.title,
        progress: chapter.progress,
        color: colors[index % colors.length],
      }));
      setRecentChapters(chaptersWithColors);
    }
    setIsLoadingChapters(false);
  };

  const info = getTourStepInfo(TOUR_STEPS.TOUR_INTRO);

  const loadTodayPlan = async () => {
    setIsLoadingPlan(true);
    try {
      const today = new Date();
      const plan = await getStudyPlan(today);

      if (plan && plan.tasks && plan.tasks.length > 0) {
        // User has a custom plan for today
        setHasCustomPlan(true);
        const tasks: Task[] = plan.tasks.map((task: StudyTask) => ({
          id: task.id,
          title: task.text,
          completed: task.completed,
          type: task.type || "lesson",
        }));
        setTodayTasks(tasks);
      } else {
        // No custom plan, use default suggestions
        setHasCustomPlan(false);
        const defaultTasks = getDefaultPlanSuggestion();
        const tasks: Task[] = defaultTasks.map((task: StudyTask) => ({
          id: task.id,
          title: task.text,
          completed: task.completed,
          type: task.type || "lesson",
        }));
        setTodayTasks(tasks);
      }
    } catch (error) {
      console.error("Failed to load today's plan:", error);
      // Fallback to default plan
      setHasCustomPlan(false);
      const defaultTasks = getDefaultPlanSuggestion();
      const tasks: Task[] = defaultTasks.map((task: StudyTask) => ({
        id: task.id,
        title: task.text,
        completed: task.completed,
        type: task.type || "lesson",
      }));
      setTodayTasks(tasks);
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const loadSatDate = async () => {
    try {
      const stored = await SecureStore.getItemAsync("onboardingAnswers");
      if (stored) {
        const answers = JSON.parse(stored);
        setSatDate(answers.satDate || null);
      }
    } catch (error) {
      console.error("Failed to load SAT date:", error);
    }
  };

  const loadWeekTaskCounts = async () => {
    try {
      const dates = getWeekDates();
      const counts = new Map<string, number>();

      for (const date of dates) {
        const dateKey = formatDateKey(date);
        const taskCount = await getTaskCount(dateKey);
        counts.set(dateKey, taskCount.total);
      }

      setWeekTaskCounts(counts);
    } catch (error) {
      console.error("Failed to load week task counts:", error);
    }
  };

  // Get week dates around selected date
  const getWeekDates = () => {
    const dates = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - 2); // 2 days before

    for (let i = 0; i < 5; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // Format date helpers
  const formatDay = (date: Date) => {
    return date.getDate();
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Toggle task completion
  const toggleTask = async (taskId: string) => {
    const updatedTasks = todayTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTodayTasks(updatedTasks);

    // Save to storage (convert default plan to custom plan if needed)
    try {
      const today = new Date();
      const plan = await getStudyPlan(today);
      const tasksToSave: StudyTask[] = updatedTasks.map((task) => ({
        id: task.id,
        text: task.title,
        completed: task.completed,
        type: task.type,
      }));

      await saveStudyPlan(today, {
        goals: plan?.goals || "",
        tasks: tasksToSave,
      });

      // If this was a default plan, now it's custom
      if (!hasCustomPlan) {
        setHasCustomPlan(true);
      }
    } catch (error) {
      console.error("Failed to save task update:", error);
    }
  };

  // Calculate completed tasks
  const completedTasks = todayTasks.filter((task) => task.completed).length;
  const totalTasks = todayTasks.length;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#111827" : "#f9fafb" },
      ]}
      edges={["bottom"]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 16,
              backgroundColor: isDark ? "#111827" : "#ffffff",
              borderBottomColor: isDark ? "#1f2937" : "#f3f4f6",
            },
          ]}
        >
          <View style={styles.headerRow}>
            {/* <TouchableOpacity activeOpacity={0.7}>
              <Image
                source={
                  isDark
                    ? require("@/assets/images/splash-icon.png")
                    : require("@/assets/images/splash-icon.png")
                }
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </TouchableOpacity> */}

            <Text
              style={[
                styles.headerTitle,
                { color: isDark ? "#ffffff" : "#1f2937" },
              ]}
            >
              Explore
            </Text>

            {/* <TouchableOpacity activeOpacity={0.7}>
              <MoreVertical size={24} color={isDark ? "#ffffff" : "#000000"} />
            </TouchableOpacity> */}
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Premium Upgrade Banner */}
          {user && !user.isPro && (
            <LinearGradient
              colors={["#06B6D4", "#0891B2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumBanner}
            >
              <View style={styles.premiumBannerRow}>
                <View style={styles.premiumBannerContent}>
                  <Text style={styles.premiumBannerTitle}>
                    Upgrade Premium!
                  </Text>
                  <Text style={styles.premiumBannerSubtitle}>
                    Enjoy all the benefits
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.premiumBannerButton}
                    onPress={() => router.push("/payment")}
                  >
                    <Text style={styles.premiumBannerButtonText}>Upgrade</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.premiumBannerImage}>
                  <Image
                    source={require("@/assets/images/golden_cap.png")}
                    style={styles.goldenCapImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </LinearGradient>
          )}

          {/* Recent Chapters */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderRow}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? "#ffffff" : "#1f2937" },
                ]}
              >
                Recent Chapters
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(tabs)/course" as any)}
              >
                <Text style={styles.viewAllButton}>View All →</Text>
              </TouchableOpacity>
            </View>

            {isLoadingChapters ? (
              <View
                style={[
                  styles.loadingContainer,
                  { backgroundColor: isDark ? "#1f2937" : "#ffffff" },
                ]}
              >
                <Text
                  style={[
                    styles.loadingText,
                    { color: isDark ? "#9ca3af" : "#6b7280" },
                  ]}
                >
                  Loading chapters...
                </Text>
              </View>
            ) : recentChapters.length === 0 ? (
              <View
                style={[
                  styles.emptyContainer,
                  { backgroundColor: isDark ? "#1f2937" : "#ffffff" },
                ]}
              >
                <Text
                  style={[
                    styles.emptyTitle,
                    { color: isDark ? "#ffffff" : "#1f2937" },
                  ]}
                >
                  No chapters started yet
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: isDark ? "#9ca3af" : "#6b7280" },
                  ]}
                >
                  Start learning to see your recent progress here
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/(tabs)/course" as any)}
                  style={styles.emptyButton}
                >
                  <Text style={styles.emptyButtonText}>Browse Chapters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chapterScrollView}
                contentContainerStyle={{ paddingRight: 24 }}
              >
                {recentChapters.map((chapter) => (
                  <TouchableOpacity
                    key={chapter.id}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/course/${chapter.id}` as any)}
                    style={[
                      styles.chapterCard,
                      {
                        backgroundColor: isDark ? "#1f2937" : "#ffffff",
                        borderLeftColor: chapter.color,
                      },
                    ]}
                  >
                    {/* Title and Progress */}
                    <View style={styles.chapterCardHeader}>
                      <Text
                        style={[
                          styles.chapterTitle,
                          { color: isDark ? "#ffffff" : "#1f2937" },
                        ]}
                      >
                        {chapter.title}
                      </Text>
                      <View style={styles.chapterProgressContainer}>
                        <Text
                          style={[
                            styles.chapterProgressText,
                            { color: chapter.color },
                          ]}
                        >
                          {chapter.progress}%
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View
                      style={[
                        styles.chapterProgressBar,
                        { backgroundColor: isDark ? "#374151" : "#e5e7eb" },
                      ]}
                    >
                      <View
                        style={[
                          styles.chapterProgressFill,
                          {
                            width: `${chapter.progress}%`,
                            backgroundColor: chapter.color,
                          },
                        ]}
                      />
                    </View>

                    {/* Continue Button */}
                    <View
                      style={[
                        styles.chapterContinueButton,
                        { backgroundColor: `${chapter.color}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chapterContinueButtonText,
                          { color: chapter.color },
                        ]}
                      >
                        Continue Learning
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                <View style={styles.chapterScrollSpacer} />
              </ScrollView>
            )}
          </View>

          {/* Week Calendar */}
          <View className="mt-8">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-6 px-6"
            >
              {weekDates.map((date, index) => {
                const selected = isSameDay(date, selectedDate);
                const today = isToday(date);
                const isSATDay = satDate && isSameDay(date, new Date(satDate));
                const dateKey = formatDateKey(date);
                const taskCount = weekTaskCounts.get(dateKey) || 0;

                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    onPress={() => {
                      const dateStr = formatDateKey(date);
                      router.push(`/calendar/day/${dateStr}` as any);
                    }}
                    className={`items-center justify-center mr-4 py-4 px-5 rounded-2xl ${
                      isSATDay
                        ? ""
                        : selected
                          ? "bg-cyan-500"
                          : isDark
                            ? "bg-gray-800"
                            : "bg-white"
                    }`}
                    style={{
                      backgroundColor: isSATDay
                        ? "#f59e0b"
                        : isDark
                          ? "#1f2937"
                          : "#fff",
                      borderBottomWidth: today ? 3 : 0,
                      borderBottomColor: "#06B6D4",
                    }}
                  >
                    <Text
                      className={`text-3xl font-bold mb-1 ${
                        isSATDay || selected
                          ? "text-white"
                          : isDark
                            ? "text-white"
                            : "text-gray-900"
                      }`}
                    >
                      {formatDay(date)}
                    </Text>
                    <Text
                      className={`text-sm ${
                        isSATDay || selected
                          ? "text-white"
                          : isDark
                            ? "text-gray-400"
                            : "text-gray-600"
                      }`}
                    >
                      {formatDayName(date)}
                    </Text>
                    {taskCount > 0 && !isSATDay && (
                      <View
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          minWidth: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: selected ? "#ffffff" : "#06B6D4",
                          justifyContent: "center",
                          alignItems: "center",
                          paddingHorizontal: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: selected ? "#06B6D4" : "#ffffff",
                          }}
                        >
                          {taskCount}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Calendar Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/calendar" as any)}
                className={`items-center justify-center py-4 px-5 rounded-2xl mr-12 ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                style={{
                  borderWidth: 2,
                  borderColor: "#06B6D4",
                  borderStyle: "dashed",
                }}
              >
                <Calendar size={32} color="#06B6D4" />
                <Text
                  className={`text-sm mt-2 font-semibold ${
                    isDark ? "text-cyan-400" : "text-cyan-600"
                  }`}
                >
                  View All
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Tour Intro - Centered Dialog */}
          {tourActive && currentStep === TOUR_STEPS.TOUR_INTRO && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}>
              <TourTooltip
                visible={true}
                onNext={handleTourNext}
                onPrev={handleTourPrev}
                onSkip={skipTour}
                onClose={() => {}}
                title={info.title}
                content={info.content}
                stepNumber={TOUR_STEPS.TOUR_INTRO + 1}
                totalSteps={TOTAL_TOUR_STEPS}
                placement="center"
                nextButtonText="Let's Go!"
                skipButtonText="No Thanks"
                showSkipButton={true}
                delayMs={600}
              >
                <View style={{ width: 1, height: 1 }} />
              </TourTooltip>
            </View>
          )}

          {/* Today's Study Plan */}
          <View className="mt-8 mb-16">
              <View className="flex-row items-center justify-between mb-4">
                <Text
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Your study plan today ({completedTasks}/{totalTasks})
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    const today = formatDateKey(new Date());
                    router.push(`/calendar/day/${today}` as any);
                  }}
                  className="flex-row items-center"
                >
                  <Edit3 size={16} color="#06B6D4" />
                  <Text className="text-cyan-500 font-semibold ml-1 text-sm">
                    {hasCustomPlan ? "Edit Plan" : "Create Plan"}
                  </Text>
                </TouchableOpacity>
              </View>

              {!hasCustomPlan && (
                <View
                  className={`mb-4 p-3 rounded-xl ${
                    isDark ? "bg-cyan-500/10" : "bg-cyan-50"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      isDark ? "text-cyan-400" : "text-cyan-700"
                    }`}
                  >
                    This is a suggested plan. Tap "Create Plan" to customize
                    your study goals for today.
                  </Text>
                </View>
              )}

              {isLoadingPlan ? (
                <View
                  className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-8 items-center`}
                >
                  <Text
                    className={`${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Loading study plan...
                  </Text>
                </View>
              ) : todayTasks.length === 0 ? (
                <View
                  className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-8 items-center`}
                >
                  <Text
                    className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    No plan for today
                  </Text>
                  <Text
                    className={`text-sm text-center mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                  >
                    Create a study plan to stay organized
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      const today = formatDateKey(new Date());
                      router.push(`/calendar/day/${today}` as any);
                    }}
                    className="bg-cyan-500 rounded-full px-6 py-2"
                  >
                    <Text className="text-white font-semibold">
                      Create Plan
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                todayTasks.map((task, index) => (
                  <View key={task.id} className="flex-row items-start mb-6">
                    {/* Timeline */}
                    <View className="items-center mr-4">
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => toggleTask(task.id)}
                      >
                        {task.completed ? (
                          <CheckCircle2 size={24} color="#06B6D4" />
                        ) : (
                          <Circle size={24} color="#06B6D4" />
                        )}
                      </TouchableOpacity>
                      {index < todayTasks.length - 1 && (
                        <View className="w-0.5 h-16 bg-cyan-500/30 mt-2" />
                      )}
                    </View>

                    {/* Task Content */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleTask(task.id)}
                      className={`flex-1 ${
                        isDark ? "bg-gray-800" : "bg-white"
                      } rounded-2xl p-4 flex-row items-center`}
                    >
                      <View className="mr-3">
                        <View className="w-10 h-10 bg-cyan-500/10 rounded-xl items-center justify-center">
                          <Text className="text-2xl">
                            {task.type === "lesson"
                              ? "📚"
                              : task.type === "quiz"
                                ? "✏️"
                                : task.type === "review"
                                  ? "🔍"
                                  : "📝"}
                          </Text>
                        </View>
                      </View>
                      <Text
                        className={`flex-1 ${
                          task.completed
                            ? isDark
                              ? "text-gray-500 line-through"
                              : "text-gray-400 line-through"
                            : isDark
                              ? "text-white"
                              : "text-gray-900"
                        } font-medium`}
                      >
                        {task.title}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
      </ScrollView>

      {/* Floating Action Button (Alternative to bottom nav) */}
      {/* <TouchableOpacity
        activeOpacity={0.8}
        className="absolute bottom-32 right-6 bg-cyan-500 w-14 h-14 rounded-full items-center justify-center shadow-lg z-10"
        style={{
          shadowColor: "#06B6D4",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => router.push("/")}
      >
        <Text className="text-2xl">🤖</Text>
      </TouchableOpacity>  */}
    </SafeAreaView>
  );
}

/**
 * StyleSheet for ExploreScreen
 *
 * Organized by sections:
 * - Container & Layout styles
 * - Header styles
 * - Premium banner styles
 * - Recent chapters styles
 * - Calendar/Week view styles
 * - Study plan styles
 * - Task item styles
 * - Common/Utility styles
 */
const styles = StyleSheet.create({
  // Container & Layout
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },

  // Header
  header: {
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerLogo: {
    width: 32,
    height: 32,
  },

  // Premium Banner
  premiumBanner: {
    marginTop: 24,
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
  },
  premiumBannerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  premiumBannerContent: {
    flex: 1,
  },
  premiumBannerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  premiumBannerSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    marginBottom: 16,
  },
  premiumBannerButton: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  premiumBannerButtonText: {
    color: "#06B6D4",
    fontWeight: "600",
  },
  premiumBannerImage: {
    marginLeft: 16,
  },
  goldenCapImage: {
    width: 108,
    height: 108,
  },

  // Section Headers
  sectionHeader: {
    marginTop: 32,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  viewAllButton: {
    color: "#06B6D4",
    fontWeight: "600",
  },

  // Loading & Empty States
  loadingContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: "#06B6D4",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  // Recent Chapters
  chapterScrollView: {
    marginLeft: -24,
    marginRight: -24,
    paddingLeft: 24,
  },
  chapterCard: {
    marginRight: 16,
    borderRadius: 16,
    padding: 16,
    width: 288,
    borderLeftWidth: 4,
  },
  chapterCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  chapterProgressContainer: {
    marginLeft: 8,
  },
  chapterProgressText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  chapterProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  chapterProgressFill: {
    height: 8,
    borderRadius: 4,
  },
  chapterContinueButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 12,
  },
  chapterContinueButtonText: {
    fontWeight: "600",
  },
  chapterScrollSpacer: {
    width: 24,
  },

  // Calendar/Week View
  weekScrollView: {
    marginLeft: -24,
    marginRight: -24,
    paddingLeft: 24,
  },
  dayButton: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  dayNumber: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dayName: {
    fontSize: 14,
  },
  taskCountBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  taskCountText: {
    fontSize: 10,
    fontWeight: "700",
  },
  calendarButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginRight: 48,
    borderWidth: 2,
    borderColor: "#06B6D4",
    borderStyle: "dashed",
  },
  calendarButtonText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
  },

  // Study Plan
  studyPlanContainer: {
    marginTop: 32,
    marginBottom: 64,
  },
  studyPlanHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  studyPlanTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  studyPlanEditButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  studyPlanEditText: {
    color: "#06B6D4",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 14,
  },
  studyPlanInfo: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
  },
  studyPlanInfoText: {
    fontSize: 14,
  },

  // Task Items
  taskRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  taskTimelineContainer: {
    alignItems: "center",
    marginRight: 16,
  },
  taskTimelineLine: {
    width: 2,
    height: 64,
    marginTop: 8,
  },
  taskContent: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  taskIconContainer: {
    marginRight: 12,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  taskIconText: {
    fontSize: 24,
  },
  taskTitle: {
    flex: 1,
    fontWeight: "500",
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
  },
});
