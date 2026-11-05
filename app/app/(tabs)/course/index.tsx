import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { BookOpen, CircleHelp, Play, Search, Trophy, X } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { ChapterWithItems, useCourseDatabase } from "@/lib/db/course";
import { useTour } from "@/context/TourContext";
import { TourTooltip } from "@/components/Tour/TourTooltip";
import { getTourStepInfo, TOTAL_TOUR_STEPS, TOUR_STEPS } from "@/constants/tourSteps";
import { Fonts, usePalette } from "@/constants/palette";
import { EmptyState, Loading, plural, PastelCard, Screen, T, Thumb, Tap } from "@/components/ds";
import { ParabolaArt } from "@/components/art";

GoogleSignin.configure({
  webClientId: "329617813146-lmmck18chg6mfgci5i4iddtialht09ij.apps.googleusercontent.com",
  scopes: ["profile", "email"],
  offlineAccess: true,
  forceCodeForRefreshToken: false,
  iosClientId: "329617813146-3o5aq7gfvejqoi3mudiar02tl4urhivu.apps.googleusercontent.com",
});

// Points earned / points available in a chapter (lessons count fully once completed, quizzes by score)
const calculateChapterProgress = (chapter: ChapterWithItems) => {
  let total = 0;
  let earned = 0;
  for (const item of chapter.items) {
    if (item.type === "lesson") {
      const pts = item.points ?? 0;
      total += pts;
      if (item.progress?.length && item.progress[0].completed) earned += pts;
    } else if (item.type === "quiz") {
      total += item.maxScore ?? 0;
      if (item.results?.length) earned += item.results[0].score ?? 0;
    }
  }
  return total > 0 ? Math.round((earned / total) * 100) : 0;
};

const isItemDone = (item: ChapterWithItems["items"][number]) =>
  item.type === "lesson" ? !!item.progress?.length && !!item.progress[0].completed : !!item.results?.length;

export default function CourseScreen() {
  const router = useRouter();
  const c = usePalette();
  const { token } = useAuth();
  const { getFullCourse, getFullCourseWithProgress } = useCourseDatabase();
  const { tourActive, currentStep, setCurrentStep, endTour, skipTour, setNumbersQuizId } = useTour();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<ChapterWithItems[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  // Quiz the tour opens
  useEffect(() => {
    setNumbersQuizId("dde1a000-1db8-47b9-9370-2796f7eaf337");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        const res = token ? await getFullCourseWithProgress() : await getFullCourse();
        if (!active) return;
        if (res.success && res.chapters) setCourse(res.chapters);
        setLoading(false);
      };
      load();
      return () => {
        active = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])
  );

  const handleTourNext = () => {
    // From "choose a topic" the tour opens the Numbers chapter
    if (currentStep === TOUR_STEPS.CHOOSE_TOPIC) {
      const numbers = course.find((ch) => ch.title.toLowerCase().includes("number"));
      if (numbers) {
        setCurrentStep(currentStep + 1);
        router.push(`/course/${numbers.id}`);
        return;
      }
    }
    if (currentStep === TOTAL_TOUR_STEPS - 1) endTour();
    else setCurrentStep(currentStep + 1);
  };
  const handleTourPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (loading) return <Loading />;

  // Course totals
  let total = 0;
  let earned = 0;
  let lessons = 0;
  let quizzes = 0;
  for (const ch of course) {
    for (const item of ch.items) {
      if (item.type === "lesson") {
        lessons++;
        total += item.points ?? 0;
        if (item.progress?.length && item.progress[0].completed) earned += item.points ?? 0;
      } else if (item.type === "quiz") {
        quizzes++;
        total += item.maxScore ?? 0;
        if (item.results?.length) earned += item.results[0].score ?? 0;
      }
    }
  }
  const courseProgress = total > 0 ? Math.round((earned / total) * 100) : 0;

  // Card under the header: continue the first unfinished chapter, or start chapter 1
  const started = !!token && course.some((ch) => ch.items.some(isItemDone));
  const nextChapter = (started ? course.find((ch) => ch.items.some((i) => !isItemDone(i))) : undefined) ?? course[0];
  const nextIndex = nextChapter ? course.indexOf(nextChapter) : -1;
  const nextProgress = nextChapter && token ? calculateChapterProgress(nextChapter) : 0;

  const q = searchQuery.trim().toLowerCase();
  const filtered = course.filter((ch) => ch.title.toLowerCase().includes(q));
  const chooseTopicInfo = getTourStepInfo(TOUR_STEPS.CHOOSE_TOPIC);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Screen tab scrollRef={scrollRef}>
        <View style={{ gap: 6 }}>
          <T variant="label">SAT Math course</T>
          <T variant="title" style={{ fontSize: 30, lineHeight: 34 }} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
            From the basics to 800
          </T>
        </View>

        {/* Header art with the continue / start card joined underneath */}
        <View style={{ borderRadius: 28, overflow: "hidden", backgroundColor: c.lav }}>
          <PastelCard tone="lav" radius={0} style={{ height: 170, padding: 0, alignItems: "center", justifyContent: "center" }}>
            <ParabolaArt width="100%" height={160} />
            {token && (
              <View style={{ position: "absolute", left: 16, top: 14, backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                <T variant="smallStrong" onPastel>
                  {courseProgress}% complete
                </T>
              </View>
            )}
          </PastelCard>
          {nextChapter && (
            <Tap
              onPress={() => router.push(`/course/${nextChapter.id}` as any)}
              style={({ pressed }) => ({
                margin: 6,
                marginTop: 0,
                borderRadius: 23,
                backgroundColor: "#0B0A0F",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 12,
                paddingLeft: 16,
                paddingRight: 10,
                opacity: pressed ? 0.88 : 1,
              })}
            >
              <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                <T variant="caption" color="rgba(255,255,255,0.65)">
                  {started ? `Continue · Chapter ${nextIndex + 1}` : "Start the course · Chapter 1"}
                </T>
                <T variant="bodyStrong" color="#fff" numberOfLines={1}>
                  {nextChapter.title.trim()}
                </T>
                {started && (
                  <View style={{ height: 4, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.18)", marginTop: 4, overflow: "hidden" }}>
                    <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${nextProgress}%`, backgroundColor: c.lav }} />
                  </View>
                )}
              </View>
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.lav, alignItems: "center", justifyContent: "center" }}>
                <Play size={19} color="#0B0A0F" strokeWidth={2.1} />
              </View>
            </Tap>
          )}
        </View>

        {/* Facts */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            { icon: BookOpen, text: plural(lessons, "lesson") },
            { icon: CircleHelp, text: plural(quizzes, "quiz") },
            { icon: Trophy, text: plural(course.length, "chapter") },
          ].map(({ icon: Icon, text }) => (
            <View key={text} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: c.line, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
                <Icon size={17} color={c.ink} strokeWidth={1.9} />
              </View>
              <T variant="caption" style={{ flex: 1 }} numberOfLines={2}>
                {text}
              </T>
            </View>
          ))}
        </View>

        {/* Search */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            borderWidth: 1.5,
            borderColor: c.line,
            backgroundColor: c.surface,
            borderRadius: 999,
            paddingHorizontal: 16,
            height: 50,
          }}
        >
          <Search size={19} color={c.muted} />
          <TextInput
            style={{ flex: 1, fontFamily: Fonts.bodySemi, fontSize: 15, color: c.ink, paddingVertical: 0 }}
            placeholder="Search chapters"
            placeholderTextColor={c.subtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Tap hitSlop={10} onPress={() => setSearchQuery("")}>
              <X size={18} color={c.muted} />
            </Tap>
          )}
        </View>

        <View style={{ gap: 10 }}>
          <T variant="h2">Chapters</T>
          {token && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
              {[
                { label: "Finished", n: course.filter((ch) => calculateChapterProgress(ch) >= 100).length, color: c.mint },
                { label: "Started", n: course.filter((ch) => calculateChapterProgress(ch) < 100 && ch.items.some(isItemDone)).length, color: c.butter },
                { label: "Not started", n: course.filter((ch) => !ch.items.some(isItemDone)).length, color: c.surface2 },
              ].map((g) => (
                <View key={g.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: g.color, borderWidth: 1, borderColor: c.line }} />
                  <T variant="caption">
                    {g.label} · {g.n}
                  </T>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ gap: 10, marginTop: -6 }}>
          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="Nothing found" text={`No chapter matches "${searchQuery}".`} />
          ) : (
            filtered.map((chapter) => {
              const index = course.indexOf(chapter);
              const progress = calculateChapterProgress(chapter);
              const lessonCount = chapter.items.filter((i) => i.type === "lesson").length;
              const quizCount = chapter.items.filter((i) => i.type === "quiz").length;
              // Colour = status: finished green, started yellow, not started grey
              const started = !!token && chapter.items.some(isItemDone);
              const tone = !token ? "neutral" : progress >= 100 ? "mint" : started ? "butter" : "neutral";

              const row = (
                <Tap
                  onPress={() => router.push(`/course/${chapter.id}` as any)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    backgroundColor: c.surface,
                    borderColor: c.line,
                    borderWidth: 1,
                    borderRadius: 20,
                    padding: 10,
                    paddingRight: 14,
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <Thumb text={String(index + 1).padStart(2, "0")} tone={tone} />
                  <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                    <T variant="bodyStrong" numberOfLines={2}>
                      {chapter.title.trim()}
                    </T>
                    <T variant="caption">
                      {plural(lessonCount, "lesson")} · {plural(quizCount, "quiz")}
                    </T>
                    {token && progress > 0 && progress < 100 && (
                      <View style={{ height: 4, borderRadius: 4, backgroundColor: c.line, marginTop: 4, overflow: "hidden" }}>
                        <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progress}%`, backgroundColor: c.ink }} />
                      </View>
                    )}
                  </View>
                  {token && (
                    <T variant="smallStrong" color={progress >= 100 ? c.success : progress > 0 ? c.ink : c.subtle}>
                      {progress}%
                    </T>
                  )}
                </Tap>
              );

              if (index === 0 && tourActive && currentStep === TOUR_STEPS.CHOOSE_TOPIC) {
                return (
                  <TourTooltip
                    key={chapter.id}
                    visible
                    onNext={handleTourNext}
                    onPrev={handleTourPrev}
                    onSkip={skipTour}
                    onClose={() => {}}
                    title={chooseTopicInfo?.title || ""}
                    content={chooseTopicInfo?.content || ""}
                    stepNumber={TOUR_STEPS.CHOOSE_TOPIC + 1}
                    totalSteps={TOTAL_TOUR_STEPS}
                    placement="bottom"
                    nextButtonText="Next"
                    skipButtonText="Skip Tour"
                    showSkipButton
                  >
                    <View>{row}</View>
                  </TourTooltip>
                );
              }
              return <View key={chapter.id}>{row}</View>;
            })
          )}
        </View>
      </Screen>

    </View>
  );
}
