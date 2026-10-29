import { useEffect, useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
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
import { calculateSATScore } from "@/lib/utils";

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

  const loadQuizzes = useCallback(async () => {
    if (!token) return;
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
  }, [token, fetchExamsLocal]);

  useEffect(() => {
    loadQuizzes();
  }, []);

  // Refresh exams list when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadQuizzes();
    }, [])
  );

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
    if (score >= 700) return "#2E9A5E"; // Green
    if (score >= 550) return "#E5A50A"; // Yellow
    if (score >= 450) return "#E5A50A"; // Orange
    return "#D93F55"; // Red
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 16,
          backgroundColor: isDark ? "#0B0A0F" : "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#17151C" : "#E5DFEE",
        }}
      >
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
            backgroundColor: isDark ? "#17151C" : "#EFEAF7",
            borderRadius: 12,
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={isDark ? "#C9AAFB" : "#7A4BDB"} />
          <Text
            style={{
              color: isDark ? "#C9AAFB" : "#7A4BDB",
              fontWeight: "600",
              marginLeft: 6,
              fontSize: 14,
            }}
          >
            Back
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: isDark ? "#F4F1F8" : "#0B0A0F",
            marginBottom: 8,
          }}
        >
          SAT Math Exams
        </Text>
        <Text style={{ fontSize: 14, color: isDark ? "#9C95A8" : "#6B6577" }}>
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
            const correctAnswered =  Math.round((quiz.progress / 100) * quiz.questionCount)
            const satScore = calculateSATScore(correctAnswered, quiz.questionCount);
            const scoreColor = satScore
              ? getScoreColor(satScore)
              : isDark
                ? "#9C95A8"
                : "#6B6577";
            const hasAttempt = quiz.attemptCount > 0;

            return (
              <TouchableOpacity
                key={quiz.id}
                onPress={() => handlePress(quiz.id, isLocked)}
                activeOpacity={0.7}
                style={{
                  marginBottom: 20,
                  backgroundColor: isDark ? "#17151C" : "#ffffff",
                  borderRadius: 16,
                  padding: 20,
                  borderLeftWidth: 4,
                  borderLeftColor: hasAttempt ? scoreColor : "#8A5CE6",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {/* Title and Lock */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: isDark ? "#F4F1F8" : "#0B0A0F",
                        marginBottom: 4,
                      }}
                    >
                      {quiz.title}
                    </Text>
                    {hasAttempt && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: isDark ? "#9C95A8" : "#6B6577",
                        }}
                      >
                        {quiz.attemptCount} attempt
                        {quiz.attemptCount > 1 ? "s" : ""}
                      </Text>
                    )}
                  </View>
                  {isLocked && (
                    <Lock
                      size={20}
                      color="#8A5CE6"
                      style={{ marginLeft: 12 }}
                    />
                  )}
                </View>

                {/* Stats Grid */}
                {hasAttempt ? (
                  <>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      {/* SAT Score */}
                      <View
                        style={{
                          backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9",
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 12,
                          borderWidth: 1,
                          borderColor: scoreColor,
                          flex: 1,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <Trophy
                            size={20}
                            color={scoreColor}
                            style={{ marginRight: 8 }}
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              color: isDark ? "#9C95A8" : "#6B6577",
                              fontWeight: "600",
                            }}
                          >
                            SAT Score
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 32,
                            fontWeight: "bold",
                            color: scoreColor,
                          }}
                        >
                          {satScore}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            color: isDark ? "#7E7889" : "#9C95A8",
                            marginTop: 4,
                          }}
                        >
                          out of 800
                        </Text>
                      </View>

                      {/* Stats Row */}
                      <View
                        style={{
                          flexDirection: "column",
                          gap: 12,
                          marginBottom: 12,
                        }}
                      >
                        {/* Correct Answers */}
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9",
                            borderRadius: 12,
                            padding: 12,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 6,
                            }}
                          >
                            <CheckCircle2
                              size={16}
                              color="#2E9A5E"
                              style={{ marginRight: 6 }}
                            />
                            <Text
                              style={{
                                fontSize: 12,
                                color: isDark ? "#9C95A8" : "#6B6577",
                              }}
                            >
                              Correct
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "flex-end",
                              gap: 4,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 20,
                                fontWeight: "bold",
                                color: isDark ? "#F4F1F8" : "#0B0A0F",
                              }}
                            >
                              {Math.round(
                                (quiz.progress / 100) * quiz.questionCount
                              )}
                            </Text>
                            <Text
                              style={{
                                fontSize: 11,
                                color: isDark ? "#7E7889" : "#9C95A8",
                                paddingBottom: 2,
                              }}
                            >
                              of {quiz.questionCount}
                            </Text>
                          </View>
                        </View>

                        {/* Accuracy */}
                        <View
                          style={{
                            flex: 1,
                            backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9",
                            borderRadius: 12,
                            padding: 12,
                            justifyContent: "center",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Target
                              size={14}
                              color={
                                quiz.progress >= 80
                                  ? "#2E9A5E"
                                  : quiz.progress >= 60
                                    ? "#E5A50A"
                                    : "#8A5CE6"
                              }
                              style={{ marginRight: 6 }}
                            />

                            <Text
                              style={{
                                fontSize: 12, // reduced font size
                                fontWeight: "600",
                                color: isDark ? "#F4F1F8" : "#0B0A0F",
                              }}
                            >
                              {quiz.progress >= 85
                                ? "Excellent"
                                : quiz.progress >= 60
                                  ? "Good"
                                  : "Practice"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Last Attempt */}
                    {quiz.lastAttempt && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingTop: 12,
                          borderTopWidth: 1,
                          borderTopColor: isDark ? "#2B2733" : "#E5DFEE",
                        }}
                      >
                        <Calendar
                          size={14}
                          color={isDark ? "#9C95A8" : "#6B6577"}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            color: isDark ? "#9C95A8" : "#6B6577",
                          }}
                        >
                          Last attempt: {formatDate(quiz.lastAttempt)}
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <View
                    style={{
                      backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9",
                      borderRadius: 12,
                      padding: 16,
                      alignItems: "center",
                    }}
                  >
                    <Clock
                      size={32}
                      color={isDark ? "#C9AAFB" : "#7A4BDB"}
                      style={{ marginBottom: 12 }}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: isDark ? "#F4F1F8" : "#0B0A0F",
                        marginBottom: 4,
                      }}
                    >
                      Not Started
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: isDark ? "#9C95A8" : "#6B6577",
                        textAlign: "center",
                      }}
                    >
                      {quiz.questionCount} questions · ~70 minutes
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 48,
            }}
          >
            <Target size={40} color={isDark ? "#9C95A8" : "#6B6577"} />
            <Text
              style={{
                fontSize: 16,
                color: isDark ? "#9C95A8" : "#6B6577",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              No exams available
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
