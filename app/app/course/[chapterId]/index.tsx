import { useEffect, useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  BookCheck,
  Trophy,
  Lock,
  CheckCircle2,
  Play,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useCourseDatabase } from "@/lib/db/course";
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";
import Svg, { Path, Circle } from "react-native-svg";
import { useTour } from "@/context/TourContext";
import { TourTooltip } from "@/components/Tour/TourTooltip";
import { TOUR_STEPS, TOTAL_TOUR_STEPS, getTourStepInfo } from "@/constants/tourSteps";

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.7; // 70% of screen width
const VERTICAL_SPACING = 140;
const LEFT_OFFSET = 16; // Padding from left edge
const RIGHT_OFFSET = 16; // Padding from right edge

type Item = {
  id: string;
  type: "lesson" | "quiz";
  title: string;
  isFree: boolean;
  progress?: any[];
  results?: any[];
  position: number;
  chapterId: string;
  videoUrl?: string;
  questionCount?: number;
};
 
export default function ChapterScreen() {
  const router = useRouter();
  const { chapterId } = useLocalSearchParams();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chapterTitle, setChapterTitle] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [showTooltips, setShowTooltips] = useState(false);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { getChapterItems } = useCourseDatabase();

  // Tour
  const { tourActive, currentStep, setCurrentStep, endTour, skipTour, numbersQuizId } = useTour();

  const loadChapter = useCallback(async () => {
    setLoading(true);
    setShowTooltips(false);
    try {
      const res = await getChapterItems(chapterId as string);
      if (res.success && res.chapter) {
        setChapterTitle(res.chapter.title);
        setItems(res.chapter.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [chapterId, getChapterItems]);

  // Load chapter data on mount
  useEffect(() => {
    loadChapter();
  }, []);

  // Reload chapter data when screen comes into focus (e.g., after returning from quiz)
  useFocusEffect(
    useCallback(() => {
      loadChapter();
    }, [])
  );

  // Delay tooltip appearance after loading completes
  useEffect(() => {
    if (!loading && tourActive) {
      const timer = setTimeout(() => {
        setShowTooltips(true);
      }, 400); // 400ms delay after page loads
      return () => clearTimeout(timer);
    } else {
      setShowTooltips(false);
    }
  }, [loading, tourActive]);

  const handleTourNext = () => {
    // If on the last step (ENTER_QUIZ), just end the tour without navigating
    if (currentStep === TOUR_STEPS.ENTER_QUIZ) {
      endTour();
      return;
    }

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

  if (loading) {
    return <GraduationCap3DLoader />;
  }

  const isCompleted = (item: Item) => {
    if (item.type === "lesson") return item.progress && item.progress.length > 0;
    return item.results && item.results.length > 0;
  };

  const getItemPosition = (index: number) => {
    const isLesson = items[index].type === "lesson";

    return {
      x: isLesson ? LEFT_OFFSET : SCREEN_WIDTH - CARD_WIDTH - RIGHT_OFFSET,
      y: 20 + (index * VERTICAL_SPACING),
      isLeft: isLesson,
    };
  };

  const renderPath = (fromIndex: number, toIndex: number) => {
    if (toIndex >= items.length) return null;

    const from = getItemPosition(fromIndex);
    const to = getItemPosition(toIndex);

    const fromCompleted = isCompleted(items[fromIndex]);
    const toCompleted = isCompleted(items[toIndex]);
    const pathColor = (fromCompleted && toCompleted) ? "#06B6D4" : (isDark ? "#374151" : "#d1d5db");

    const startX = from.x + CARD_WIDTH / 2;
    const startY = from.y + 60;
    const endX = to.x + CARD_WIDTH / 2;
    const endY = to.y;

    // If both items are on the same side (both lessons or both quizzes)
    if (from.isLeft === to.isLeft) {
      // Straight line
      return (
        <Path
          key={`path-${fromIndex}-${toIndex}`}
          d={`M ${startX} ${startY} L ${endX} ${endY}`}
          stroke={pathColor}
          strokeWidth="3"
          fill="none"
          strokeDasharray={fromCompleted && toCompleted ? "0" : "8,8"}
        />
      );
    } else {
      // Curved path (hyperbola-like) between lesson and quiz
      const controlX1 = startX;
      const controlY1 = startY + (endY - startY) * 0.3;
      const controlX2 = endX;
      const controlY2 = endY - (endY - startY) * 0.3;

      return (
        <Path
          key={`path-${fromIndex}-${toIndex}`}
          d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
          stroke={pathColor}
          strokeWidth="3"
          fill="none"
          strokeDasharray={fromCompleted && toCompleted ? "0" : "8,8"}
        />
      );
    }
  };

  const handleItemPress = (item: Item, index: number) => {
    // Check if item is locked (not free and user is not PRO)
    const itemWithFreeFlag = items[index] as Item & { isFree?: boolean };
    const isItemLocked = !user?.isPro && !itemWithFreeFlag.isFree;

    if (isItemLocked) {
      router.push("/payment");
      return;
    }

    const flatItems = items.map(i => ({ ...i, chapterId }));
    router.push({
      pathname: `/course/${chapterId}/${item.type}/${item.id}` as any,
      params: {
        allItems: JSON.stringify(flatItems),
        currentIndex: index
      },
    });
  };

  const contentHeight = items.length * VERTICAL_SPACING + 200;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f9fafb" }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 12,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: isDark ? "#111827" : "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
        zIndex: 10,
      }}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
            borderRadius: 12,
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={isDark ? "#06B6D4" : "#0891B2"} />
          <Text style={{ color: isDark ? "#06B6D4" : "#0891B2", fontWeight: "600", marginLeft: 6, fontSize: 14 }}>
            Back
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={{ fontSize: 24, fontWeight: "bold", color: isDark ? "#ffffff" : "#1f2937", marginBottom: 4 }}>
          {chapterTitle}
        </Text>
        <Text style={{ fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280" }}>
          {items.length} items · {items.filter(isCompleted).length} completed
        </Text>
      </View>

      {/* Content with SVG Path */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: contentHeight, position: "relative" }}>
          {/* SVG for paths */}
          <Svg
            height={contentHeight}
            width={SCREEN_WIDTH}
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            {items.map((_, index) => {
              if (index < items.length - 1) {
                return renderPath(index, index + 1);
              }
              return null;
            })}
          </Svg>

          {/* Items */}
          {items.map((item, index) => {
            const completed = isCompleted(item);
            const pos = getItemPosition(index);
            const isLocked = !user?.isPro && !item.isFree;
            const isLesson = item.type === "lesson";

            // Get quiz progress percentage
            const quizProgress = !isLesson && item.results && item.results.length > 0
              ? Math.round((item.results[0].score / item.results[0].maxScore) * 100) // Assuming score is percentage
              : null;

            // Determine if this item should show a tooltip
            const firstLesson = items.find(i => i.type === "lesson");
            const firstQuiz = items.find(i => i.type === "quiz");
            const isFirstLesson = item.id === firstLesson?.id;
            const isFirstQuiz = item.id === firstQuiz?.id;

            const showLessonTooltip = tourActive && currentStep === TOUR_STEPS.LESSONS_SECTION && isFirstLesson && showTooltips;
            const showQuizTooltip = tourActive && currentStep === TOUR_STEPS.ENTER_QUIZ && item.id === numbersQuizId && showTooltips;

            const tooltipVisible = (showLessonTooltip || showQuizTooltip) && showTooltips;

            let tooltipInfo = null;
            if (showLessonTooltip) tooltipInfo = getTourStepInfo(TOUR_STEPS.LESSONS_SECTION);
            if (showQuizTooltip) tooltipInfo = getTourStepInfo(TOUR_STEPS.ENTER_QUIZ);

            // Render card content
            const cardContent = (
              <>
                {/* Header: Icon, Lock, and Progress */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {completed ? (
                      <CheckCircle2 size={24} color="#10B981" />
                    ) : isLesson ? (
                      (item.videoUrl) ? (
                        <Play size={24} color={isDark ? "#06B6D4" : "#0891B2"} fill={isDark ? "#06B6D4" : "#0891B2"} />
                      ) : (
                        <BookOpen size={24} color={isDark ? "#06B6D4" : "#0891B2"} />
                      )
                    ) : (
                      <Trophy size={24} color={isDark ? "#8B5CF6" : "#7C3AED"} />
                    )}
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    {quizProgress !== null && (
                      <Text style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: isDark ? "#8B5CF6" : "#7C3AED",
                      }}>
                        {quizProgress}%
                      </Text>
                    )}
                    {isLocked && <Lock size={16} color={isDark ? "#6b7280" : "#9ca3af"} />}
                  </View>
                </View>

                {/* Title */}
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: isDark ? "#ffffff" : "#1f2937",
                    marginBottom: 4,
                  }}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>

                {/* Type Badge and Question Count */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    backgroundColor: completed ? "#10B98110" : (isLesson ? "#06B6D410" : "#8B5CF610"),
                  }}>
                    <Text style={{
                      fontSize: 11,
                      fontWeight: "600",
                      color: completed ? "#10B981" : (isLesson ? "#06B6D4" : "#8B5CF6"),
                    }}>
                      {item.type.toUpperCase()}
                    </Text>
                  </View>

                  {/* Question count for quizzes */}
                  {!isLesson && item.questionCount !== undefined && item.questionCount > 0 && (
                    <Text style={{
                      fontSize: 11,
                      fontWeight: "500",
                      color: isDark ? "#9ca3af" : "#6b7280",
                    }}>
                      • {item.questionCount} {item.questionCount === 1 ? 'question' : 'questions'}
                    </Text>
                  )}
                </View>
              </>
            );

            // Wrap with tooltip if needed
            if (tooltipVisible && tooltipInfo) {
              return (
                <View
                  key={item.id}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    width: CARD_WIDTH,
                    zIndex: 1000,
                  }}
                >
                  <TourTooltip
                    visible={tooltipVisible}
                    onNext={handleTourNext}
                    onPrev={handleTourPrev}
                    onSkip={skipTour}
                    onClose={() => {}}
                    title={tooltipInfo.title}
                    content={tooltipInfo.content}
                    stepNumber={currentStep + 1}
                    totalSteps={TOTAL_TOUR_STEPS}
                    placement="bottom"
                    nextButtonText={currentStep === TOUR_STEPS.ENTER_QUIZ ? "Finish Guide" : "Next"}
                    skipButtonText="Skip Tour"
                    showSkipButton={currentStep !== TOUR_STEPS.ENTER_QUIZ}
                  >
                    <TouchableOpacity
                      onPress={() => handleItemPress(item, index)}
                      activeOpacity={isLocked ? 1 : 0.7}
                      style={{
                        width: CARD_WIDTH,
                        backgroundColor: isDark ? "#1e293b" : "#ffffff",
                        borderRadius: 16,
                        padding: 16,
                        borderLeftWidth: 4,
                        borderLeftColor: completed ? "#10B981" : (isLesson ? "#06B6D4" : "#8B5CF6"),
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 3,
                        opacity: isLocked ? 0.5 : 1,
                      }}
                    >
                      {cardContent}
                    </TouchableOpacity>
                  </TourTooltip>
                </View>
              );
            }

            // Normal card without tooltip
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleItemPress(item, index)}
                activeOpacity={isLocked ? 1 : 0.7}
                style={{
                  position: "absolute",
                  left: pos.x,
                  top: pos.y,
                  width: CARD_WIDTH,
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  borderRadius: 16,
                  padding: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: completed ? "#10B981" : (isLesson ? "#06B6D4" : "#8B5CF6"),
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                {cardContent}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
