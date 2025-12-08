import { useRef, useState, useCallback, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Lock, MoreVertical, BookMarked, Search, X } from "lucide-react-native";
import { ChapterWithItems, useCourseDatabase } from "@/lib/db/course";
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";
import { useTour } from "@/context/TourContext";
import { TourTooltip } from "@/components/Tour/TourTooltip";
import { TOUR_STEPS, TOTAL_TOUR_STEPS, getTourStepInfo } from "@/constants/tourSteps";

GoogleSignin.configure({
  webClientId:
    "329617813146-lmmck18chg6mfgci5i4iddtialht09ij.apps.googleusercontent.com",
  scopes: ["profile", "email"],
  offlineAccess: true,
  forceCodeForRefreshToken: false,
  iosClientId:
    "329617813146-3o5aq7gfvejqoi3mudiar02tl4urhivu.apps.googleusercontent.com",
});

// Helper functions
const calculateChapterProgress = (chapter: ChapterWithItems) => {
  let totalPoints = 0;
  let earnedPoints = 0;

  for (const item of chapter.items) {
    if (item.type === "lesson") {
      const lessonPoints = item.points ?? 0;
      totalPoints += lessonPoints;
      // If lesson is completed, add all its points
      if (item.progress?.length && item.progress[0].completed) {
        earnedPoints += lessonPoints;
      }
    } else if (item.type === "quiz") {
      const maxScore = item.maxScore ?? 0;
      totalPoints += maxScore;
      // Add the actual score the user earned
      if (item.results?.length) {
        earnedPoints += item.results[0].score ?? 0;
      }
    }
  }

  return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
};

const getChapterColor = (progress: number) => {
  if (progress >= 90) return "#10B981"; // Green
  if (progress >= 70) return "#EAB308"; // Yellow
  if (progress >= 50) return "#8B5CF6"; // Purple
  if (progress >= 30) return "#06B6D4"; // Blue/Cyan
  if (progress >= 10) return "#EF4444"; // Red
  return "#6B7280"; // Neutral gray
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { token, user } = useAuth();
  const { getFullCourse, getFullCourseWithProgress } = useCourseDatabase();
  const {
    tourActive,
    currentStep,
    setCurrentStep,
    endTour,
    skipTour,
    setNumbersQuizId,
  } = useTour();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<ChapterWithItems[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  // Set the quiz ID for tour when component mounts
  useEffect(() => {
    setNumbersQuizId("dde1a000-1db8-47b9-9370-2796f7eaf337");
  }, []);

  // Load course
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const load = async () => {
        setLoading(true);
        let res;
        if (!token) {
          res = await getFullCourse();
        } else {
          res = await getFullCourseWithProgress();
        }

        if (!isActive) return;

        //console.log(res.chapters![2].items[2]);
        //console.log(res.chapters![2].items[3]);

        if (res.success && res.chapters) {
          setCourse(res.chapters);
          setTimeout(() => {
            const firstUnfinishedIndex = findFirstUnfinishedIndex(
              res.chapters!
            );
            if (scrollRef.current && firstUnfinishedIndex >= 0) {
              scrollRef.current.scrollTo({
                y: firstUnfinishedIndex * 80,
                animated: true,
              });
            }
          }, 300);
        }

        setLoading(false);
      };

      load();

      return () => {
        isActive = false;
      };
    }, [token]) // you can keep token if needed for DB queries
  );

  // useEffect(() => {
  //   console.log("🧠 Course mounted");

  //   return () => {
  //     console.log("🧹 Course unmounted");
  //   };
  // }, []);

  useEffect(() => {
    if (tourActive) {
      if (currentStep === TOUR_STEPS.INCORRECT_ANSWERS) {
        router.push("/(tabs)/tests");
      }
    }
  }, [tourActive, currentStep]);

  const handleTourNext = () => {
    // Special handling for COURSE_TAB step - navigate to Numbers chapter when clicking Next
    if (currentStep === TOUR_STEPS.COURSE_TAB) {
      const numbersChapter = course.find((ch) =>
        ch.title.toLowerCase().includes("number")
      );
      if (numbersChapter) {
        setCurrentStep(currentStep + 1); // Move to LESSONS_SECTION step
        router.push(`/course/${numbersChapter.id}`);
        return;
      }
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

  // --- Helpers ---
  const findFirstUnfinishedIndex = (chapters: ChapterWithItems[]) => {
    let index = 0;
    for (const chapter of chapters) {
      for (const item of chapter.items) {
        if (item.type === "lesson" && !item.progress?.length) return index;
        if (item.type === "quiz" && !item.results?.length) return index;
        index++;
      }
    }
    return -1;
  };

  const calculateCourseProgress = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const chapter of course) {
      for (const item of chapter.items) {
        if (item.type === "lesson") {
          const lessonPoints = item.points ?? 0;
          totalPoints += lessonPoints;
          // If lesson is completed, add all its points
          if (item.progress?.length && item.progress[0].completed) {
            earnedPoints += lessonPoints;
          }
        } else if (item.type === "quiz") {
          const maxScore = item.maxScore ?? 0;
          totalPoints += maxScore;
          // Add the actual score the user earned
          if (item.results?.length) {
            earnedPoints += item.results[0].score ?? 0;
          }
        }
      }
    }

    return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  };

  const filteredCourse = course.filter((chapter) =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (loading) {
    return <GraduationCap3DLoader />;
  }

  const courseProgress = calculateCourseProgress();
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (circumference * courseProgress) / 100;

  const info = getTourStepInfo(TOUR_STEPS.COURSE_TAB);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#111827" : "#f9fafb" }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: isDark ? "#111827" : "#ffffff",
            borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
          },
        ]}
      >
        {/* Title and Progress */}
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { color: isDark ? "#ffffff" : "#1f2937" }]}>
            SAT Math Course
          </Text>
          {token && (
            <View style={[styles.progressBadge, { backgroundColor: isDark ? "#1f2937" : "#f3f4f6" }]}>
              <Text style={[styles.progressBadgeText, { color: isDark ? "#06B6D4" : "#0891B2" }]}>
                {courseProgress}% Complete
              </Text>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: isDark ? "#1f2937" : "#f3f4f6" }]}>
          <Search size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? "#ffffff" : "#1f2937" }]}
            placeholder="Search chapters..."
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity activeOpacity={0.7} onPress={clearSearch} style={styles.clearButton}>
              <X size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chapters List */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredCourse.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: isDark ? "#9ca3af" : "#6b7280" }]}>
              No chapters found matching "{searchQuery}"
            </Text>
          </View>
        ) : (
          filteredCourse.map((chapter, cIndex) => {
            const chapterProgress = calculateChapterProgress(chapter);
            const chapterColor = getChapterColor(chapterProgress);

            // Chapters are never locked - locking is at the lesson/quiz level based on isFree flag
            const isLocked = false;

            const lessonsCount = chapter.items.filter((i) => i.type === "lesson").length;
            const quizzesCount = chapter.items.filter((i) => i.type === "quiz").length;

            // Create the chapter card element
            const chapterCard = (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  router.push(`/course/${chapter.id}` as any);
                }}
                style={[
                  styles.chapterCard,
                  {
                    backgroundColor: isDark ? "#1e293b" : "#ffffff",
                    borderLeftColor: chapterColor,
                  },
                ]}
              >
                {/* Title and Progress */}
                <View style={styles.headerRow}>
                  <Text
                    style={[
                      styles.chapterTitle,
                      { color: isDark ? "#ffffff" : "#1f2937" },
                    ]}
                  >
                    {chapter.title}
                  </Text>
                  {token && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressCenter}>
                        <Text style={[styles.progressText, { color: chapterColor }]}>
                          {chapterProgress}%
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Stats */}
                <Text
                  style={[
                    styles.statsText,
                    { color: isDark ? "#94a3b8" : "#6b7280" },
                  ]}
                >
                  {lessonsCount} lessons · {quizzesCount} quizzes
                </Text>

                {/* Footer */}
                <View style={styles.footerRow}>
                  {/* Progress Badge */}
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: isDark ? "#334155" : "#f3f4f6" },
                    ]}
                  >
                    <BookMarked size={14} color={isDark ? "#94a3b8" : "#6b7280"} />
                    <Text
                      style={[
                        styles.badgeText,
                        { color: isDark ? "#94a3b8" : "#6b7280" },
                      ]}
                    >
                      {chapter.items.length} items
                    </Text>
                  </View>

                  {/* Lock Icon and More */}
                  <View style={styles.actionsRow}>
                    {isLocked && (
                      <Lock size={16} color="#2563eb" style={styles.lockIcon} />
                    )}
                    <TouchableOpacity activeOpacity={0.7}>
                      <MoreVertical size={20} color={isDark ? "#94a3b8" : "#6b7280"} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );

            // Wrap with tooltip if this is the first chapter and tour is active
            if (cIndex === 0 && tourActive && currentStep === TOUR_STEPS.COURSE_TAB) {
              return (
                <TourTooltip
                  key={999}
                  visible={true}
                  onNext={handleTourNext}
                  onPrev={handleTourPrev}
                  onSkip={skipTour}
                  onClose={() => {}}
                  title={info.title}
                  content={info.content}
                  stepNumber={TOUR_STEPS.COURSE_TAB + 1}
                  totalSteps={TOTAL_TOUR_STEPS}
                  placement="bottom"
                >
                  {chapterCard}
                </TourTooltip>
              );
            }

            // Return normal card without tooltip
            return <View key={cIndex}>{chapterCard}</View>;
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 48,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
  chapterCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
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
  progressContainer: {
    marginLeft: 8,
  },
  progressCenter: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statsText: {
    fontSize: 14,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    marginLeft: 6,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  lockIcon: {
    marginRight: 12,
  },
});

// type CourseItem = {
//   id: string;
//   title: string;
//   type: "lesson" | "quiz";
//   chapterId: string;
//   progress?: any[];
//   results?: any[];
// };

// export default function HomeScreen() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [course, setCourse] = useState<any>(null);
//   const scrollRef = useRef<ScrollView>(null);
//   const { token } = useAuth();
//   const insets = useSafeAreaInsets();
//   const colorScheme = useColorScheme();
//   const { getFullCourseWithProgress,getFullCourse } = useCourseDatabase();

//   const isDark = colorScheme === "dark";

//   const bgColor = isDark ? "#0f172a" : "#f8fafc";
//   const textColor = isDark ? "#f1f5f9" : "#1f2937";
//   const subTextColor = isDark ? "#cbd5e1" : "#6b7280";

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       let res;
//       if (!token) {
//         res = await getFullCourse();
//         //({ success, data } = await fetchCourse());
//       } else {
//         res = await getFullCourseWithProgress();
//         //({ success, data } = await fetchCourseWithProgress(token));
//       }

//       if (res.success  && res.chapters) {
//         setCourse(res.chapters);
//         setTimeout(() => {
//           const firstUnfinishedIndex = findFirstUnfinishedIndex(res.chapters);
//           if (scrollRef.current && firstUnfinishedIndex >= 0) {
//             scrollRef.current.scrollTo({ y: firstUnfinishedIndex * 160, animated: true });
//           }
//         }, 300);
//       }
//       setLoading(false);
//     };
//     load();
//   }, [token]);

//   const findFirstUnfinishedIndex = (chapters: ChapterWithItems[]) => {
//     if (!Array.isArray(chapters)) return -1;

//     let index = 0;

//     for (const chapter of chapters) {
//       for (const item of chapter.items) {
//         if (item.type === "lesson") {
//           if (!item.progress?.length) return index;
//         } else if (item.type === "quiz") {
//           if (!item.results?.length) return index;
//         }
//         index++;
//       }
//     }

//     return -1;
//   };

//   // const findFirstUnfinishedIndex = (course: any) => {
//   //   let index = 0;
//   //   for (const chapter of course.chapters) {
//   //     for (const lesson of chapter.lessons) {
//   //       if (!lesson.progress?.length) return index;
//   //       index++;
//   //     }
//   //     for (const quiz of chapter.quizzes) {
//   //       if (!quiz.results?.length) return index;
//   //       index++;
//   //     }
//   //   }
//   //   return -1;
//   // };

//   const calculateCourseProgress = () => {
//     if (!course) return 0;
//     let total = 0;
//     let completed = 0;
//     for (const chapter of course.chapters) {
//       for (const lesson of chapter.lessons) {
//         total++;
//         if (lesson.progress?.length) completed++;
//       }
//       for (const quiz of chapter.quizzes) {
//         total++;
//         if (quiz.results?.length) completed++;
//       }
//     }
//     return total ? Math.round((completed / total) * 100) : 0;
//   };

//   const allItems = useMemo(() => {
//     if (!course) return [];
//     return course.chapters.flatMap((chapter: any) => [
//       ...(chapter.lessons || []).map((l: any) => ({ ...l, type: "lesson", chapterId: chapter.id })),
//       ...(chapter.quizzes || []).map((q: any) => ({ ...q, type: "quiz", chapterId: chapter.id })),
//     ]);
//   }, [course]);

//   if (loading) {
//     return (
//       <SafeAreaView style={{ flex: 1, backgroundColor: bgColor, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#22d3ee" />
//       </SafeAreaView>
//     );
//   }

//   const courseProgress = calculateCourseProgress();
//   const radius = 50;
//   const strokeWidth = 10;
//   const circumference = 2 * Math.PI * radius;
//   const progressOffset = circumference - (circumference * courseProgress) / 100;

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }} edges={['bottom']}>
//       {/* <TopBlur /> */}

//       {token ? (
//         <View
//           style={{
//             paddingTop: insets.top + 8,
//             paddingBottom: 12,
//             paddingHorizontal: 16,
//             borderBottomLeftRadius: 32,
//             borderBottomRightRadius: 32,
//             backgroundColor: isDark ? "#0f172a" : "#f8fafc",
//             shadowColor: "#000",
//             shadowOffset: { width: 0, height: 5 },
//             shadowOpacity: 0.1,
//             shadowRadius: 12,
//             elevation: 5,
//             overflow: "hidden",
//             alignItems: "center",
//           }}
//         >
//           <LinearGradient
//             colors={["#6366F1", "#8B5CF6", "#22d3ee"]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={StyleSheet.absoluteFill}
//           />

//           <Text style={{ fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 16, textAlign: "center" }}>
//             {course?.title}
//           </Text>

//           <View style={{ marginBottom: 16, justifyContent: "center", alignItems: "center" }}>
//             <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
//               <Circle
//                 cx={radius + strokeWidth / 2}
//                 cy={radius + strokeWidth / 2}
//                 r={radius}
//                 stroke={isDark ? "#334155" : "#e5e7eb"}
//                 strokeWidth={strokeWidth}
//                 fill="none"
//               />
//               <Defs>
//                 <LinearGradientSvg id="grad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
//                   <Stop offset="0%" stopColor="#6366F1" />
//                   <Stop offset="50%" stopColor="#8B5CF6" />
//                   <Stop offset="100%" stopColor="#22d3ee" />
//                 </LinearGradientSvg>
//               </Defs>
//               <Circle
//                 cx={radius + strokeWidth / 2}
//                 cy={radius + strokeWidth / 2}
//                 r={radius}
//                 stroke="url(#grad)"
//                 strokeWidth={strokeWidth}
//                 strokeDasharray={circumference}
//                 strokeDashoffset={progressOffset}
//                 strokeLinecap="round"
//                 fill="none"
//               />
//             </Svg>
//             <Text style={{ position: "absolute", color: "#fff", fontSize: 18, fontWeight: "bold" }}>
//               {courseProgress}%
//             </Text>
//           </View>
//         </View>
//       ) : (
//         <View style={{ overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 }}>
//           <Image
//             source={require('@/assets/images/satCourseImg.jpg')}
//             style={{ width: "100%", height: 250, resizeMode: "cover" }}
//           />
//         </View>
//       )}

//       <ScrollView
//         ref={scrollRef}
//         contentContainerStyle={{ padding: 16, paddingBottom: 34 }}
//         showsVerticalScrollIndicator={false}
//       >
//         {course?.chapters?.map((chapter: any, cIndex: number) => {
//           const chapterItems = allItems.filter((i: CourseItem) => i.chapterId === chapter.id);

//           return (
//             <View key={cIndex} style={{ marginBottom: 12 }}>
//               <Text style={{ fontSize: 18, fontWeight: "600", color: textColor, marginBottom: 12 }}>
//                 {chapter.title}
//               </Text>

//               {chapterItems.map((item: CourseItem) => {
//                 const globalIndex = allItems.findIndex(
//                   (i: CourseItem) => i.id === item.id && i.type === item.type
//                 );

//                 const gradientColors: [string, string, ...string[]] =
//                   item.type === "lesson"
//                     ? item.progress?.length
//                       ? ["#6366F1", "#8B5CF6"] // completed lesson
//                       : ["#E5E7EB", "#F3F4F6"] // incomplete lesson
//                     : item.results?.length
//                     ? ["#10B981", "#059669"] // completed quiz
//                     : ["#D1FAE5", "#A7F3D0"];

//                 const textCol =
//                   item.type === "lesson"
//                     ? item.progress?.length
//                       ? "#fff"
//                       : "#1f2937"
//                     : item.results?.length
//                     ? "#fff"
//                     : "#1f2937";

//                 return (
//                   <TouchableOpacity
//                     key={`${item.type}-${item.id}`}
//                     onPress={() =>
//                       router.push({
//                         pathname: `/course/${item.chapterId}/${item.type}/${item.id}` as any,
//                         params: { allItems: JSON.stringify(allItems), currentIndex: globalIndex },
//                       })
//                     }
//                     style={{
//                       borderRadius: 14,
//                       marginBottom: 16,
//                       overflow: "hidden",
//                       shadowColor: "#000",
//                       shadowOffset: { width: 0, height: 4 },
//                       shadowOpacity: 0.1,
//                       shadowRadius: 8,
//                       elevation: 5,
//                     }}
//                   >
//                     <LinearGradient
//                       colors={gradientColors}
//                       start={{ x: 0, y: 0 }}
//                       end={{ x: 1, y: 1 }}
//                       style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingVertical: 10, borderRadius: 14 }}
//                     >
//                       <View className="mr-4">
//                         {item.type === 'lesson'
//                           ? item.progress?.length
//                             ? <BookOpenCheck size={28} color={textCol} />
//                             : <BookOpen size={28} color={textCol} />
//                           : item.results?.length
//                           ? <BookCheck size={28} color={textCol} />
//                           : <Pencil size={28} color={textCol} />}
//                       </View>
//                       <Text style={{ color: textCol, fontSize: 16, fontWeight: "600" }}>
//                         {item.title}
//                       </Text>
//                     </LinearGradient>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           );
//         })}
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
