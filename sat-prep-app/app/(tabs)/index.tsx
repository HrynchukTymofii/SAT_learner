import { useEffect, useRef, useMemo, useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { fetchCourse, fetchCourseWithProgress } from "@/lib/api/course";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Stop, LinearGradient as LinearGradientSvg } from "react-native-svg";
import TopBlur from "@/components/ui/TobBlur";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: "329617813146-lmmck18chg6mfgci5i4iddtialht09ij.apps.googleusercontent.com",
  scopes: ["profile", "email"],
  offlineAccess: true,
  forceCodeForRefreshToken: false,
  iosClientId: "329617813146-3o5aq7gfvejqoi3mudiar02tl4urhivu.apps.googleusercontent.com",
});

type CourseItem = {
  id: string;
  title: string;
  type: "lesson" | "quiz";
  chapterId: string;
  progress?: any[];
  results?: any[];
};

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      let success: boolean;
      let data: any;

      if (!token) {
        ({ success, data } = await fetchCourse());
      } else {
        ({ success, data } = await fetchCourseWithProgress(token));
      }
      
      if (success) {
        setCourse(data.course);

        setTimeout(() => {
          const firstUnfinishedIndex = findFirstUnfinishedIndex(data.course);
          if (scrollRef.current && firstUnfinishedIndex >= 0) {
            scrollRef.current.scrollTo({ y: firstUnfinishedIndex * 140, animated: true });
          }
        }, 300);
      }
      setLoading(false);
    };
    load();
  }, [token]);

  const findFirstUnfinishedIndex = (course: any) => {
    let index = 0;
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (!lesson.progress?.length) return index;
        index++;
      }
      for (const quiz of chapter.quizzes) {
        if (!quiz.results?.length) return index;
        index++;
      }
    }
    return -1;
  };

  const calculateCourseProgress = () => {
    if (!course) return 0;
    let total = 0;
    let completed = 0;
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        total++;
        if (lesson.progress?.length) completed++;
      }
      for (const quiz of chapter.quizzes) {
        total++;
        if (quiz.results?.length) completed++;
      }
    }
    return total ? Math.round((completed / total) * 100) : 0;
  };

  // Flatten all lessons + quizzes
  const allItems = useMemo(() => {
    if (!course) return [];
    return course.chapters.flatMap((chapter: any) => [
      ...(chapter.lessons || []).map((l: any) => ({
        ...l,
        type: "lesson",
        chapterId: chapter.id,
      })),
      ...(chapter.quizzes || []).map((q: any) => ({
        ...q,
        type: "quiz",
        chapterId: chapter.id,
      })),
    ]);
  }, [course]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </SafeAreaView>
    );
  }

  const courseProgress = calculateCourseProgress();
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (circumference * courseProgress) / 100;

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-white">
      <TopBlur />
  {token ? (
    // ✅ Logged-in user view with progress circle
    <View
      className="items-center justify-center p-6 rounded-b-3xl shadow-lg overflow-hidden"
      style={{ paddingTop: insets.top + 16 }}
    >
      {/* Gradient Background */}
      <LinearGradient
        colors={["#7C3AED", "#EC4899", "#FBBF24"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0 rounded-b-3xl"
      />

      {/* Course Title */}
      <Text className="text-2xl font-bold mb-4 text-center text-white">
        {course?.title}
      </Text>

      {/* Progress Circle */}
      <View className="relative items-center justify-center">
        <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
          {/* Background Circle */}
          <Circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Gradient Progress */}
          <Defs>
            <LinearGradientSvg
              id="grad"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
              gradientUnits="objectBoundingBox"
            >
              <Stop offset="0%" stopColor="#7C3AED" />
              <Stop offset="50%" stopColor="#EC4899" />
              <Stop offset="100%" stopColor="#FBBF24" />
            </LinearGradientSvg>
          </Defs>

          <Circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            stroke="url(#grad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>

        {/* Percentage Text */}
        <Text className="absolute text-white text-lg font-bold">
          {courseProgress}%
        </Text>
      </View>
    </View>
  ) : (
    // ✅ Guest view with full-width image
    <View className="overflow-hidden rounded-b-3xl shadow-lg">
      <Image
        source={require('@/assets/images/satCourseImg.jpg')}
        style={{
          width: '100%',
          height: 250, // adjust as needed
          resizeMode: 'cover',
        }}
      />
    </View>
  )}

      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {course?.chapters?.map((chapter: any, cIndex: number) => {
          const chapterItems = allItems.filter((i: CourseItem) => i.chapterId === chapter.id);

          return (
            <View key={cIndex} className="mb-4">
              {/* Chapter Title */}
              <Text className="text-lg font-semibold text-gray-800 mb-3">{chapter.title}</Text>

              {chapterItems.map((item: CourseItem, index: number) => {
                const globalIndex = allItems.findIndex(
                  (i: CourseItem) => i.id === item.id && i.type === item.type
                );

                return (
                  <TouchableOpacity
                    key={`${item.type}-${item.id}`}
                    onPress={() =>
                      router.push({
                        pathname: `/course/${item.chapterId}/${item.type}/${item.id}` as any,
                        params: { allItems: JSON.stringify(allItems), currentIndex: globalIndex },
                      })
                    }
                    className="mb-3 rounded-lg overflow-hidden"
                  >
                    <LinearGradient
                      colors={
                        item.type === "lesson"
                          ? item.progress?.length
                            ? ["#6366F1", "#8B5CF6"]
                            : ["#E5E7EB", "#F3F4F6"]
                          : item.results?.length
                          ? ["#10B981", "#059669"]
                          : ["#D1FAE5", "#A7F3D0"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="rounded-2xl p-4 shadow-sm"
                    >
                      <Text
                        className={`text-base font-medium ${
                          item.type === "lesson"
                            ? item.progress?.length
                              ? "text-white"
                              : "text-gray-800"
                            : item.results?.length
                            ? "text-white"
                            : "text-gray-800"
                        }`}
                      >
                        {item.title}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
