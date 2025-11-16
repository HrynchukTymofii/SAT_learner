import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  BookCheck,
  Trophy,
  Lock,
  CheckCircle2,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useCourseDatabase } from "@/lib/db/course";
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";
import Svg, { Path, Circle } from "react-native-svg";

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.7; // 70% of screen width
const VERTICAL_SPACING = 140;
const LEFT_OFFSET = 16; // Padding from left edge
const RIGHT_OFFSET = 16; // Padding from right edge

type Item = {
  id: string;
  type: "lesson" | "quiz";
  title: string;
  progress?: any[];
  results?: any[];
  position: number;
  chapterId: string;
};

export default function ChapterScreen() {
  const router = useRouter();
  const { chapterId } = useLocalSearchParams();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chapterTitle, setChapterTitle] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { getChapterItems } = useCourseDatabase();

  useEffect(() => {
    const loadChapter = async () => {
      setLoading(true);
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
    };
    loadChapter();
  }, [chapterId]);

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
    const startY = from.y + 60; // Bottom of card
    const endX = to.x + CARD_WIDTH / 2;
    const endY = to.y; // Top of card

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
    // Check if previous items are completed
    if (index > 0) {
      const prevCompleted = items.slice(0, index).every(i => isCompleted(i));
      if (!prevCompleted && !user?.isPro) {
        return; // Can't access if previous not completed
      }
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
            const isLocked = index > 0 && !items.slice(0, index).every(i => isCompleted(i)) && !user?.isPro;
            const isLesson = item.type === "lesson";

            // Get quiz progress percentage
            const quizProgress = !isLesson && item.results && item.results.length > 0
              ? Math.round((item.results[0].score / 100) * 100) // Assuming score is percentage
              : null;

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
                {/* Header: Icon, Lock, and Progress */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {completed ? (
                      <CheckCircle2 size={24} color="#10B981" />
                    ) : isLesson ? (
                      <BookOpen size={24} color={isDark ? "#06B6D4" : "#0891B2"} />
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

                {/* Type Badge */}
                <View style={{
                  alignSelf: "flex-start",
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
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
