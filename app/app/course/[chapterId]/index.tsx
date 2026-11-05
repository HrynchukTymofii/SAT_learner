import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { BookOpen, Check, CircleHelp, Lock, Play, PlayCircle } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useCourseDatabase } from "@/lib/db/course";
import { useTour } from "@/context/TourContext";
import { TourTooltip } from "@/components/Tour/TourTooltip";
import { getTourStepInfo, TOTAL_TOUR_STEPS, TOUR_STEPS } from "@/constants/tourSteps";
import { Fonts, usePalette } from "@/constants/palette";
import { Loading, PastelCard, PillButton, plural, ProgressBar, Screen, T, Tag, TopBar, Tap } from "@/components/ds";

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
  const c = usePalette();
  const { chapterId } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chapterTitle, setChapterTitle] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [showTooltips, setShowTooltips] = useState(false);
  const { getChapterItems } = useCourseDatabase();
  const { tourActive, currentStep, setCurrentStep, endTour, skipTour, numbersQuizId } = useTour();

  const loadChapter = useCallback(async () => {
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

  // Reload when coming back from a lesson or quiz
  useFocusEffect(
    useCallback(() => {
      loadChapter();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  // Tooltips appear a moment after the list
  useEffect(() => {
    if (!loading && tourActive) {
      const timer = setTimeout(() => setShowTooltips(true), 400);
      return () => clearTimeout(timer);
    }
    setShowTooltips(false);
  }, [loading, tourActive]);

  const handleTourNext = () => {
    if (currentStep === TOUR_STEPS.ENTER_QUIZ || currentStep === TOTAL_TOUR_STEPS - 1) {
      endTour();
      return;
    }
    setCurrentStep(currentStep + 1);
  };
  const handleTourPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (loading) return <Loading />;

  const isCompleted = (item: Item) =>
    item.type === "lesson" ? !!item.progress && item.progress.length > 0 : !!item.results && item.results.length > 0;

  const handleItemPress = (item: Item, index: number) => {
    if (!user?.isPro && !item.isFree) {
      router.push("/payment");
      return;
    }
    const flatItems = items.map((i) => ({ ...i, chapterId }));
    router.push({
      pathname: `/course/${chapterId}/${item.type}/${item.id}` as any,
      params: { allItems: JSON.stringify(flatItems), currentIndex: index },
    });
  };

  const doneCount = items.filter(isCompleted).length;
  const progress = items.length ? Math.round((doneCount / items.length) * 100) : 0;
  const nextIndex = items.findIndex((i) => !isCompleted(i));
  const next = nextIndex >= 0 ? items[nextIndex] : undefined;
  const lessonCount = items.filter((i) => i.type === "lesson").length;
  const quizCount = items.length - lessonCount;
  const firstLesson = items.find((i) => i.type === "lesson");

  return (
    <Screen
      header={<TopBar />}
      footer={
        next ? (
          <PillButton
            title={`${doneCount === 0 ? "Start" : "Continue"}: ${next.title.trim()}`}
            icon={Play}
            onPress={() => handleItemPress(next, nextIndex)}
          />
        ) : undefined
      }
    >
      {/* Chapter header */}
      <PastelCard tone="butter" radius={28} style={{ padding: 20, gap: 10 }}>
        <T variant="smallStrong" onPastel>
          {plural(lessonCount, "lesson")} · {plural(quizCount, "quiz")}
        </T>
        <T style={{ fontFamily: Fonts.display, fontSize: 30, lineHeight: 32, letterSpacing: -0.7 }} onPastel>
          {chapterTitle.trim()}
        </T>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 }}>
          <ProgressBar value={progress} onPastel style={{ flex: 1 }} />
          <T variant="smallStrong" onPastel>
            {doneCount}/{items.length} done
          </T>
        </View>
      </PastelCard>

      {/* Steps */}
      <View>
        {items.map((item, index) => {
          const completed = isCompleted(item);
          const isLocked = !user?.isPro && !item.isFree;
          const isLesson = item.type === "lesson";
          const isNext = index === nextIndex;
          const last = index === items.length - 1;
          const quizScore =
            !isLesson && item.results && item.results.length > 0 && item.results[0].maxScore
              ? Math.round((item.results[0].score / item.results[0].maxScore) * 100)
              : null;

          const showLessonTooltip = tourActive && currentStep === TOUR_STEPS.LESSONS_SECTION && item.id === firstLesson?.id && showTooltips;
          const showQuizTooltip = tourActive && currentStep === TOUR_STEPS.ENTER_QUIZ && item.id === numbersQuizId && showTooltips;
          const tooltipInfo = showLessonTooltip
            ? getTourStepInfo(TOUR_STEPS.LESSONS_SECTION)
            : showQuizTooltip
              ? getTourStepInfo(TOUR_STEPS.ENTER_QUIZ)
              : null;

          const Icon = isLocked ? Lock : isLesson ? (item.videoUrl ? PlayCircle : BookOpen) : CircleHelp;

          const card = (
            <Tap
              onPress={() => handleItemPress(item, index)}
              style={({ pressed }) => ({
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderRadius: 20,
                backgroundColor: isNext ? c.lav : c.surface,
                borderWidth: isNext ? 0 : 1,
                borderColor: c.line,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View style={{ flex: 1, gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Icon size={14} color={isNext ? c.onPastel : c.muted} strokeWidth={2.2} />
                  <T variant="caption" color={isNext ? c.onPastel : c.muted}>
                    {isLesson ? (item.videoUrl ? "Video lesson" : "Lesson") : "Quiz"}
                    {!isLesson && item.questionCount ? ` · ${plural(item.questionCount, "question")}` : ""}
                  </T>
                </View>
                <T variant="bodyStrong" color={isNext ? c.onPastel : c.ink} numberOfLines={2}>
                  {item.title.trim()}
                </T>
                {isNext && (
                  <T variant="smallStrong" onPastel>
                    Up next →
                  </T>
                )}
              </View>
              {quizScore !== null && <Tag label={`${quizScore}%`} tone={quizScore >= 70 ? "mint" : "butter"} />}
              {isLocked && <Tag label="PRO" tone="ink" icon={Lock} />}
            </Tap>
          );

          return (
            <View key={item.id} style={{ flexDirection: "row", gap: 12 }}>
              {/* Timeline */}
              <View style={{ width: 34, alignItems: "center" }}>
                <View style={{ width: 2, height: 18, backgroundColor: index === 0 ? "transparent" : completed ? c.ink : c.line }} />
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: completed ? c.inkButton : isNext ? c.lav : c.surface,
                    borderWidth: completed || isNext ? 0 : 1.5,
                    borderColor: c.line,
                  }}
                >
                  {completed ? (
                    <Check size={17} color={c.inkButtonText} strokeWidth={3} />
                  ) : (
                    <T variant="smallStrong" color={isNext ? c.onPastel : c.muted}>
                      {index + 1}
                    </T>
                  )}
                </View>
                {!last && <View style={{ width: 2, flex: 1, backgroundColor: completed && isCompleted(items[index + 1]) ? c.ink : c.line }} />}
              </View>

              <View style={{ flex: 1, paddingVertical: 6 }}>
                {tooltipInfo ? (
                  <TourTooltip
                    visible
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
                    <View>{card}</View>
                  </TourTooltip>
                ) : (
                  card
                )}
              </View>
            </View>
          );
        })}
      </View>

      {!next && items.length > 0 && (
        <PastelCard tone="mint" radius={24} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.onPastel, alignItems: "center", justifyContent: "center" }}>
            <Check size={20} color="#fff" strokeWidth={3} />
          </View>
          <View style={{ flex: 1 }}>
            <T variant="bodyStrong" onPastel>
              Chapter complete
            </T>
            <T variant="caption" onPastel>
              Retake any quiz to raise your score.
            </T>
          </View>
        </PastelCard>
      )}
    </Screen>
  );
}
