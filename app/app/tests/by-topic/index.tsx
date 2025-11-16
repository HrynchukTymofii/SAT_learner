import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Book,
  BookCheck,
  ArrowLeft,
  Lock,
  Search,
  X,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useQuizDatabase } from "@/lib/db/quiz";
import { useColorScheme } from "@/hooks/useColorScheme";
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";

type Quiz = {
  id: string;
  title: string;
  questionCount: number;
  progress: number;
  completed: boolean;
  score: number;
  attemptCount: number;
  lastAttempt?: string;
};

export default function TestsByTopicScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filtered, setFiltered] = useState<Quiz[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { fetchQuizzesByTopicLocal } = useQuizDatabase();

  useEffect(() => {
    if (!token) router.push("/login");
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const loadQuizzes = async () => {
      try {
        const res = await fetchQuizzesByTopicLocal();
        if (res.success) {
          setQuizzes(res.quizzes);
          setFiltered(res.quizzes);
        } else {
          console.warn("Failed to load quizzes:", res.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadQuizzes();
  }, []);

  useEffect(() => {
    setFiltered(
      quizzes.filter((q) =>
        !q.title.toLowerCase().startsWith("sat exam".toLowerCase()) &&
        !q.title.toLowerCase().startsWith("theory check".toLowerCase()) &&
        q.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, quizzes]);

  if (loading) {
    return <GraduationCap3DLoader />;
  }

  const getProgressColor = (p: number) => {
    if (p >= 90) return "#10B981"; // Green
    if (p >= 70) return "#EAB308"; // Yellow
    if (p >= 50) return "#8B5CF6"; // Purple
    if (p >= 30) return "#06B6D4"; // Blue/Cyan
    if (p >= 10) return "#EF4444"; // Red
    return "#6B7280"; // Neutral gray
  };

  const clearSearch = () => {
    setSearch("");
  };

  const handlePress = (quizId: string, isLocked: boolean) => {
    if (isLocked) {
      router.push("/payment");
      return;
    }
    router.push(`/tests/by-topic/${quizId}` as any);
  }
    

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
        <Text style={{ fontSize: 24, fontWeight: "bold", color: isDark ? "#ffffff" : "#1f2937", marginBottom: 8 }}>
          Practice by Topic
        </Text>
        <Text style={{ fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280", marginBottom: 16 }}>
          Focus on specific topics to improve your skills
        </Text>

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
            placeholder="Search topics..."
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
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

      {/* Topics List */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length ? (
          filtered.map((quiz, index) => {
            const progressColor = getProgressColor(quiz.progress);
            const isLocked = !user?.isPro && index > 3 || false;

            return (
              <TouchableOpacity
                key={quiz.id}
                onPress={() => handlePress(quiz.id, isLocked)}
                activeOpacity={0.7}
                style={{
                  marginBottom: 16,
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  borderRadius: 16,
                  padding: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: progressColor,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {/* Title and Progress */}
                <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                    {quiz.progress > 0 ? (
                      <BookCheck size={24} color={isDark ? "#06B6D4" : "#0891B2"} style={{ marginRight: 12 }} />
                    ) : (
                      <Book size={24} color={isDark ? "#9ca3af" : "#6b7280"} style={{ marginRight: 12 }} />
                    )}
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "bold",
                        color: isDark ? "#ffffff" : "#1f2937",
                        flex: 1,
                      }}
                      numberOfLines={2}
                    >
                      {quiz.title}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 8, flexDirection: "row", alignItems: "center" }}>
                    {isLocked && <Lock size={16} color="#2563eb" style={{ marginRight: 8 }} />}
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: progressColor }}>
                      {quiz.progress}%
                    </Text>
                  </View>
                </View>

                {/* Stats */}
                <Text style={{ fontSize: 14, color: isDark ? "#94a3b8" : "#6b7280" }}>
                  {quiz.questionCount} questions
                  {quiz.attemptCount > 0 && ` · ${quiz.attemptCount} attempt${quiz.attemptCount > 1 ? 's' : ''}`}
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center", marginTop: 48 }}>
            <Book size={40} color={isDark ? "#9ca3af" : "#6b7280"} />
            <Text style={{ fontSize: 16, color: isDark ? "#9ca3af" : "#6b7280", marginTop: 8, textAlign: "center" }}>
              {search ? `No topics found matching "${search}"` : "No available topics"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
