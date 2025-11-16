import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Trophy,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Target,
  Calendar,
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
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { fetchExamsLocal } = useQuizDatabase();

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

  if (loading) {
    return <GraduationCap3DLoader />;
  }

  const handlePress = (quizId: string, isLocked: boolean) => {
    if (isLocked) {
      router.push("/payment");
      return;
    }
    router.push(`/tests/exams/${quizId}` as any);
  };

  const getScoreColor = (score: number) => {
    if (score >= 650) return "#10B981"; // Green
    if (score >= 550) return "#EAB308"; // Yellow
    if (score >= 450) return "#F59E0B"; // Orange
    return "#EF4444"; // Red
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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
          SAT Math Exams
        </Text>
        <Text style={{ fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280" }}>
          Full-length practice tests with 44 questions
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {quizzes.length ? (
          quizzes.map((quiz, index) => {
            const isLocked = !user?.isPro && index > 1;
            const scoreColor = quiz.score ? getScoreColor(quiz.score) : isDark ? "#9ca3af" : "#6b7280";
            const hasAttempt = quiz.attemptCount > 0;

            return (
              <TouchableOpacity
                key={quiz.id}
                onPress={() => handlePress(quiz.id, isLocked)}
                activeOpacity={0.7}
                style={{
                  marginBottom: 20,
                  backgroundColor: isDark ? "#1e293b" : "#ffffff",
                  borderRadius: 16,
                  padding: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: hasAttempt ? scoreColor : "#06B6D4",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {/* Title and Lock */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: isDark ? "#ffffff" : "#1f2937",
                        marginBottom: 4,
                      }}
                    >
                      {quiz.title}
                    </Text>
                    {hasAttempt && (
                      <Text style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280" }}>
                        {quiz.attemptCount} attempt{quiz.attemptCount > 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                  {isLocked && (
                    <Lock size={20} color="#2563eb" style={{ marginLeft: 12 }} />
                  )}
                </View>

                {/* Stats Grid */}
                {hasAttempt ? (
                  <>
                    {/* SAT Score */}
                    <View style={{
                      backgroundColor: isDark ? "#0f172a" : "#f9fafb",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: scoreColor,
                    }}>
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                        <Trophy size={20} color={scoreColor} style={{ marginRight: 8 }} />
                        <Text style={{ fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280", fontWeight: "600" }}>
                          SAT Score
                        </Text>
                      </View>
                      <Text style={{ fontSize: 32, fontWeight: "bold", color: scoreColor }}>
                        {quiz.score}
                      </Text>
                      <Text style={{ fontSize: 12, color: isDark ? "#6b7280" : "#9ca3af", marginTop: 4 }}>
                        out of 800
                      </Text>
                    </View>

                    {/* Stats Row */}
                    <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                      {/* Correct Answers */}
                      <View style={{
                        flex: 1,
                        backgroundColor: isDark ? "#0f172a" : "#f9fafb",
                        borderRadius: 12,
                        padding: 12,
                      }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                          <CheckCircle2 size={16} color="#10B981" style={{ marginRight: 6 }} />
                          <Text style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280" }}>
                            Correct
                          </Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: "bold", color: isDark ? "#ffffff" : "#1f2937" }}>
                          {Math.round((quiz.progress / 100) * quiz.questionCount)}
                        </Text>
                        <Text style={{ fontSize: 11, color: isDark ? "#6b7280" : "#9ca3af" }}>
                          of {quiz.questionCount}
                        </Text>
                      </View>

                      {/* Accuracy */}
                      <View style={{
                        flex: 1,
                        backgroundColor: isDark ? "#0f172a" : "#f9fafb",
                        borderRadius: 12,
                        padding: 12,
                      }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                          <Target size={16} color="#06B6D4" style={{ marginRight: 6 }} />
                          <Text style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280" }}>
                            Accuracy
                          </Text>
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: "bold", color: isDark ? "#ffffff" : "#1f2937" }}>
                          {quiz.progress}%
                        </Text>
                        <Text style={{ fontSize: 11, color: isDark ? "#6b7280" : "#9ca3af" }}>
                          {quiz.progress >= 80 ? 'Excellent' : quiz.progress >= 60 ? 'Good' : 'Practice'}
                        </Text>
                      </View>
                    </View>

                    {/* Last Attempt */}
                    {quiz.lastAttempt && (
                      <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? "#334155" : "#e5e7eb" }}>
                        <Calendar size={14} color={isDark ? "#9ca3af" : "#6b7280"} style={{ marginRight: 6 }} />
                        <Text style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280" }}>
                          Last attempt: {formatDate(quiz.lastAttempt)}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View style={{
                    backgroundColor: isDark ? "#0f172a" : "#f9fafb",
                    borderRadius: 12,
                    padding: 16,
                    alignItems: "center",
                  }}>
                    <Clock size={32} color={isDark ? "#06B6D4" : "#0891B2"} style={{ marginBottom: 12 }} />
                    <Text style={{ fontSize: 16, fontWeight: "600", color: isDark ? "#ffffff" : "#1f2937", marginBottom: 4 }}>
                      Not Started
                    </Text>
                    <Text style={{ fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280", textAlign: "center" }}>
                      {quiz.questionCount} questions · ~70 minutes
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center", marginTop: 48 }}>
            <Target size={40} color={isDark ? "#9ca3af" : "#6b7280"} />
            <Text style={{ fontSize: 16, color: isDark ? "#9ca3af" : "#6b7280", marginTop: 8, textAlign: "center" }}>
              No exams available
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
