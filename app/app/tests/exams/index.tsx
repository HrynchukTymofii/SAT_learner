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
import { Play } from "lucide-react-native";
import { Fonts, usePalette } from "@/constants/palette";
import { EmptyState, Loading, PastelCard, PillButton, Screen, T, Tap, TopBar } from "@/components/ds";
import { StopwatchArt } from "@/components/art";

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
  const c = usePalette();

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
    return <Loading />;
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

  const scoreOf = (q: Quiz) => calculateSATScore(Math.round((q.progress / 100) * q.questionCount), q.questionCount);
  const locked = (index: number) => !user?.isPro && index > 1;
  const attempted = quizzes.filter((q) => q.attemptCount > 0);
  const best = attempted.reduce((m, q) => Math.max(m, scoreOf(q)), 0);
  // Up next: the first exam you haven't taken (and can open), else the first one you can open
  const nextIndex = (() => {
    const fresh = quizzes.findIndex((q, i) => q.attemptCount === 0 && !locked(i));
    return fresh >= 0 ? fresh : quizzes.findIndex((_, i) => !locked(i));
  })();
  const next = nextIndex >= 0 ? quizzes[nextIndex] : null;

  return (
    <Screen header={<TopBar />}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flex: 1, gap: 6 }}>
          <T variant="title">Practice exams</T>
          <T variant="small" style={{ fontSize: 14 }}>
            Full SAT Math: 44 questions, 70 min
          </T>
        </View>
        {attempted.length > 0 && (
          <View style={{ alignItems: "flex-end" }}>
            <T variant="caption">Best score</T>
            <T style={{ fontFamily: Fonts.display, fontSize: 28, lineHeight: 32 }} color={best >= 700 ? c.success : c.ink}>
              {best}
            </T>
          </View>
        )}
      </View>

      {quizzes.length === 0 ? (
        <EmptyState icon={Target} title="No exams yet" text="Exams show up here once the course is downloaded." />
      ) : (
        <>
          {next && (
            <PastelCard tone="lav" radius={28} onPress={() => handlePress(next.id, false)} style={{ padding: 20, gap: 8, minHeight: 190 }}>
              <View style={{ position: "absolute", right: 14, top: 14 }} pointerEvents="none">
                <StopwatchArt size={96} />
              </View>
              <T variant="smallStrong" onPastel style={{ opacity: 0.7 }}>
                {next.attemptCount > 0 ? "Try again" : "Up next"} · Exam {nextIndex + 1}
              </T>
              <T style={{ fontFamily: Fonts.display, fontSize: 26, lineHeight: 29, letterSpacing: -0.5, paddingRight: 110 }} onPastel numberOfLines={2}>
                {next.title.trim()}
              </T>
              <PillButton tone="white" title={next.attemptCount > 0 ? "Retake exam" : "Start exam"} icon={Play} onPress={() => handlePress(next.id, false)} style={{ marginTop: "auto" }} />
            </PastelCard>
          )}

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
              <T variant="h2">All exams</T>
              <T variant="caption">
                {attempted.length} of {quizzes.length} taken
              </T>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {quizzes.map((quiz, index) => {
                const isLocked = locked(index);
                const taken = quiz.attemptCount > 0;
                const score = taken ? scoreOf(quiz) : 0;
                const bg = isLocked ? c.surface2 : taken ? (score >= 700 ? c.mint : c.butter) : c.surface;
                const fg = taken && !isLocked ? c.onPastel : c.ink;
                return (
                  <Tap
                    key={quiz.id}
                    onPress={() => handlePress(quiz.id, isLocked)}
                    accessibilityLabel={`${quiz.title}${taken ? `, score ${score}` : ""}${isLocked ? ", PRO" : ""}`}
                    style={({ pressed }) => ({
                      width: "31.5%",
                      aspectRatio: 0.95,
                      borderRadius: 22,
                      padding: 12,
                      justifyContent: "space-between",
                      backgroundColor: bg,
                      borderWidth: taken && !isLocked ? 0 : 1,
                      borderColor: c.line,
                      opacity: pressed ? 0.85 : isLocked ? 0.75 : 1,
                    })}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <T variant="caption" color={taken && !isLocked ? c.onPastel : c.muted}>
                        Exam
                      </T>
                      {isLocked ? <Lock size={14} color={c.muted} /> : index === nextIndex ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.brand }} /> : null}
                    </View>
                    <T style={{ fontFamily: Fonts.display, fontSize: 30, lineHeight: 34 }} color={fg}>
                      {index + 1}
                    </T>
                    <T variant="smallStrong" color={taken && !isLocked ? c.onPastel : c.muted} style={{ fontSize: 12 }}>
                      {isLocked ? "PRO" : taken ? `Score ${score}` : "New"}
                    </T>
                  </Tap>
                );
              })}
            </View>
          </View>
        </>
      )}
    </Screen>
  );
}
