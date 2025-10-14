import { useEffect, useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Target,
  Trophy,
  BookOpen,
  BookCheck,
  ArrowLeft,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useQuizDatabase } from "@/lib/db/quiz";

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
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filtered, setFiltered] = useState<Quiz[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { fetchExamsLocal } = useQuizDatabase();

  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const inputBg = isDark ? "#1e293b" : "#ffffff";
  const inputBorder = isDark ? "#334155" : "#e5e7eb";
  const textColor = isDark ? "#f1f5f9" : "#1f2937";
  const subTextColor = isDark ? "#cbd5e1" : "#6b7280";

  useEffect(() => {
    if (!token) router.push("/login");
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const loadQuizzes = async () => {
      try {
        const res = await fetchExamsLocal();
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
        q.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, quizzes]);

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: bgColor,
        }}
      >
        <ActivityIndicator size="large" color="#22d3ee" />
      </SafeAreaView>
    );
  }

  const getProgressGradient = (p: number): [string, string] => {
    // subtle muted gradients
    if (p >= 80)
      return isDark ? ["#34d399", "#10b981"] : ["#2ed08b", "#0ea972"]; // green
    if (p >= 60)
      return isDark ? ["#fbbf24", "#f59e0b"] : ["#f9b81f", "#f4970b"];
    return isDark ? ["#1e293b", "#273449"] : ["#f1f5f9", "#e2e8f0"];
  };

  const handlePress = (quizId: string) =>
    router.push(`/tests/exams/${quizId}` as any);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: bgColor,
        paddingBottom: 20,
        paddingTop: 8,
      }}
    >
      {/* Header */}
      <LinearGradient
        colors={["#3b82f6", "#2563eb"]}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5,
          marginBottom: 16,
          alignSelf: "flex-start",
          marginLeft: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/tests")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <ArrowLeft size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
            Back to Exams{" "}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading */}
        <View style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: isDark ? "#60a5fa" : "#2563eb",
              marginBottom: 4,
            }}
          >
            SAT Math Exam
          </Text>
          <Text
            style={{
              color: subTextColor,
              fontSize: 15,
              marginBottom: 8,
            }}
          >
            Here you can take the full test version of the SAT Math exam. It
            includes 44 questions and is timed, so try to complete it as if it
            were the real test!
          </Text>
        </View>
        {filtered.length ? (
          filtered.map((quiz) => {
            const gradientColors = getProgressGradient(quiz.progress);
            const itemTextColor = quiz.progress >= 60 ? "#ffffff" : textColor;

            return (
              <TouchableOpacity
                key={quiz.id}
                onPress={() => handlePress(quiz.id)}
                style={{
                  marginBottom: 16,
                  borderRadius: 16,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    borderRadius: 16,
                  }}
                >
                  <BookCheck
                    size={28}
                    color={itemTextColor}
                    style={{ marginRight: 12 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: itemTextColor,
                        marginBottom: 4,
                      }}
                    >
                      {quiz.title}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 14, color: itemTextColor }}>
                        Questions: {quiz.questionCount}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: itemTextColor,
                        }}
                      >
                        {quiz.progress}%
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })
        ) : (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: 50,
            }}
          >
            <BookOpen size={40} color={subTextColor} />
            <Text style={{ fontSize: 16, color: subTextColor, marginTop: 8 }}>
              {search ? "No topics found" : "No available topics"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
