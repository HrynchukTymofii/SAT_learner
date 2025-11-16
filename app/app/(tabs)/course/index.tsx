import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image, StyleSheet, TextInput } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { fetchCourse, fetchCourseWithProgress } from "@/lib/api/course";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Stop, LinearGradient as LinearGradientSvg } from "react-native-svg";
import TopBlur from "@/components/ui/TobBlur";
import { useColorScheme } from "@/hooks/useColorScheme";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { BookCheck, BookOpen, BookOpenCheck, Lock, Pencil, MoreVertical, BookMarked, Search, X } from "lucide-react-native";
import { ChapterWithItems, useCourseDatabase } from "@/lib/db/course";
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";

GoogleSignin.configure({
  webClientId: "329617813146-lmmck18chg6mfgci5i4iddtialht09ij.apps.googleusercontent.com",
  scopes: ["profile", "email"],
  offlineAccess: true,
  forceCodeForRefreshToken: false,
  iosClientId: "329617813146-3o5aq7gfvejqoi3mudiar02tl4urhivu.apps.googleusercontent.com",
});

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const { token, user } = useAuth();
  const { getFullCourse, getFullCourseWithProgress } = useCourseDatabase();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<ChapterWithItems[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<ScrollView>(null);

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
            const firstUnfinishedIndex = findFirstUnfinishedIndex(res.chapters!);
            if (scrollRef.current && firstUnfinishedIndex >= 0) {
              scrollRef.current.scrollTo({ y: firstUnfinishedIndex * 80, animated: true });
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
    let total = 0;
    let completed = 0;
    for (const chapter of course) {
      for (const item of chapter.items) {
        total++;
        if ((item.type === "lesson" && item.progress?.length) || (item.type === "quiz" && item.results?.length)) {
          completed++;
        }
      }
    }
    return total ? Math.round((completed / total) * 100) : 0;
  };

  const calculateChapterProgress = (chapter: ChapterWithItems) => {
    let total = chapter.items.length;
    let completed = 0;
    for (const item of chapter.items) {
      if ((item.type === "lesson" && item.progress?.length) || (item.type === "quiz" && item.results?.length)) {
        completed++;
      }
    }
    return total ? Math.round((completed / total) * 100) : 0;
  };

  const getChapterColor = (progress: number) => {
    if (progress >= 90) return "#10B981"; // Green
    if (progress >= 70) return "#EAB308"; // Yellow
    if (progress >= 50) return "#8B5CF6"; // Purple
    if (progress >= 30) return "#06B6D4"; // Blue/Cyan
    if (progress >= 10) return "#EF4444"; // Red
    return "#6B7280"; // Neutral gray
  };

  const filteredCourse = course.filter(chapter =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (loading) {
    return (
      <GraduationCap3DLoader />
    );
  }

  const courseProgress = calculateCourseProgress();
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (circumference * courseProgress) / 100;

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
      }}>
        {/* Title and Progress */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: isDark ? "#ffffff" : "#1f2937" }}>
            SAT Math Course
          </Text>
          {token && (
            <View style={{
              backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: isDark ? "#06B6D4" : "#0891B2" }}>
                {courseProgress}% Complete
              </Text>
            </View>
          )}
        </View>

        {/* Search Bar */}
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 6,
        }}>
          <Search size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: isDark ? "#ffffff" : "#1f2937",
            }}
            placeholder="Search chapters..."
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={clearSearch}
              style={{ marginLeft: 8 }}
            >
              <X size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chapters List */}
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {filteredCourse.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center", marginTop: 48 }}>
            <Text style={{ fontSize: 16, color: isDark ? "#9ca3af" : "#6b7280", textAlign: "center" }}>
              No chapters found matching "{searchQuery}"
            </Text>
          </View>
        ) : (
          filteredCourse.map((chapter, cIndex) => {
            const originalIndex = course.findIndex(ch => ch.id === chapter.id);
          const chapterProgress = calculateChapterProgress(chapter);
          const chapterColor = getChapterColor(chapterProgress);
          const isLocked = !user?.isPro && cIndex > 1;
          const lessonsCount = chapter.items.filter(i => i.type === "lesson").length;
          const quizzesCount = chapter.items.filter(i => i.type === "quiz").length;
          const flatItems = course.flatMap(ch => ch.items.map(i => ({ ...i, chapterId: ch.id })));
          const firstItem = chapter.items[0];

          return (
            <TouchableOpacity
              key={cIndex}
              activeOpacity={0.7}
              onPress={() => {
                if (isLocked) {
                  router.push("/payment");
                  return;
                }
                router.push(`/course/${chapter.id}` as any);
              }}
              style={{
                marginBottom: 16,
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderRadius: 16,
                padding: 16,
                borderLeftWidth: 4,
                borderLeftColor: chapterColor,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Title and Progress */}
              <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: isDark ? "#ffffff" : "#1f2937", flex: 1 }}>
                  {chapter.title}
                </Text>
                {token && (
                  <View style={{ marginLeft: 8 }}>
                    <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontSize: 18, fontWeight: "bold", color: chapterColor }}>
                        {chapterProgress}%
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Stats */}
              <Text style={{ fontSize: 14, color: isDark ? "#94a3b8" : "#6b7280", marginBottom: 16 }}>
                {lessonsCount} lessons · {quizzesCount} quizzes
              </Text>

              {/* Footer */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                {/* Progress Badge */}
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: isDark ? "#334155" : "#f3f4f6"
                }}>
                  <BookMarked size={14} color={isDark ? "#94a3b8" : "#6b7280"} />
                  <Text style={{ marginLeft: 6, fontSize: 12, color: isDark ? "#94a3b8" : "#6b7280" }}>
                    {chapter.items.length} items
                  </Text>
                </View>

                {/* Lock Icon and More */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {isLocked && (
                    <Lock size={16} color="#2563eb" style={{ marginRight: 12 }} />
                  )}
                  <TouchableOpacity activeOpacity={0.7}>
                    <MoreVertical size={20} color={isDark ? "#94a3b8" : "#6b7280"} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })
        )}
      </ScrollView>
    </View>
  );
}

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
