import React from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts, usePalette } from "@/constants/palette";
import { Card, GUTTER, PastelCard, PillButton, T, TopBar } from "@/components/ds";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { ArrowLeft, RotateCcw, Target, Trophy } from "lucide-react-native";

interface ResultsCardProps {
  results: {
    passed: boolean;
    percentage: number;
    correctCount: number;
    totalQuestions: number;
    satScore?: number;
  };
  pageType: "exam" | "topic" | "saved" | "random" | "wrong";
  backUrl: string;
  nextTopicUrl?: string;
  setIsResetDialogOpen: (open: boolean) => void;
  handleRetakeQuiz: () => void;
  handleBack: (needSave?: boolean) => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  isDark?: boolean;
}

export default function ResultsModal({
  results,
  pageType,
  backUrl,
  nextTopicUrl,
  setIsResetDialogOpen,
  handleRetakeQuiz,
  handleBack,
  showResults,
  setShowResults,
  isDark = false,
}: ResultsCardProps) {
  const router = useRouter();
  const c = usePalette();
  const insets = useSafeAreaInsets();

  if (!showResults || !results) return null;
  //console.log(results)

  const getGradientColors = (
  percentage: number,
  isDark: boolean
): readonly [string, string] => {
    if (percentage >= 90) {
      // Green
      return isDark ? ["#2E9A5E", "#2E9A5E"] : ["#2E9A5E", "#2E9A5E"];
    } else if (percentage >= 60) {
      // Yellow
      return isDark ? ["#facc15", "#ca8a04"] : ["#fef08a", "#facc15"];
    } else if (percentage >= 30) {
      // Blue
      return isDark ? ["#8A5CE6", "#8A5CE6"] : ["#8A5CE6", "#8A5CE6"];
    } else {
      // Slate gray
      return isDark ? ["#7E7889", "#475569"] : ["#cbd5e1", "#9C95A8"];
    }
  };

  const getResultText = (percentage: number, pageType: string): string => {
    if (pageType === "exam") {
      if (percentage >= 90) return "Exam Passed! 🎉";
      if (percentage >= 60) return "Almost Passed…";
      if (percentage >= 30) return "Keep Trying!";
      return "Unfortunately, you did not pass";
    } else {
      if (percentage >= 90) return "Excellent! 🌟";
      if (percentage >= 60) return "Good Job!";
      if (percentage >= 30) return "Keep Going!";
      return "Needs Improvement…";
    }
  };

  const getResultDescription = (percentage: number, pageType: string): string => {
    if (pageType === "exam") {
      if (percentage >= 90) return "Congratulations! You successfully completed the exam!";
      if (percentage >= 60) return "Good effort! Review a few points and try again.";
      if (percentage >= 30) return "Keep practicing and improve your skills!";
      return "Try again after reviewing the material.";
    } else {
      if (percentage >= 90) return "You successfully passed the test!";
      if (percentage >= 60) return "Nice work! Keep practicing to master it.";
      if (percentage >= 30) return "Keep studying and improving!";
      return "Don't worry, keep practicing and you’ll get it!";
    }
  };

  const tone = results.passed || results.percentage >= 90 ? "mint" : results.percentage >= 60 ? "butter" : results.percentage >= 30 ? "lav" : "rose";
  const big = pageType === "exam" && results.satScore ? String(results.satScore) : `${results.percentage}%`;

  return (
    <Animated.View
      entering={SlideInDown.delay(50)}
      exiting={SlideOutDown}
      style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "100%", backgroundColor: c.bg, zIndex: 9999, paddingTop: insets.top + 8 }}
    >
      <View style={{ paddingHorizontal: GUTTER, paddingBottom: 8 }}>
        <TopBar onBack={() => setShowResults(false)} title="Results" />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 10, paddingBottom: insets.bottom + 30, gap: 16 }}>
        <PastelCard tone={tone} radius={32} style={{ padding: 24, alignItems: "center", gap: 6 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.onPastel, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
            {results.passed ? <Trophy size={30} color={c[tone]} strokeWidth={2} /> : <Target size={30} color={c[tone]} strokeWidth={2} />}
          </View>
          <T variant="label" onPastel style={{ opacity: 0.7 }}>
            {pageType === "exam" ? "SAT Math score" : "Your score"}
          </T>
          <T style={{ fontFamily: Fonts.display, fontSize: 64, lineHeight: 68, letterSpacing: -2 }} onPastel>
            {big}
          </T>
          <T variant="h2" onPastel style={{ textAlign: "center" }}>
            {getResultText(results.percentage, pageType).replace(/ [🎉🌟]/u, "")}
          </T>
          <T variant="small" onPastel style={{ textAlign: "center", maxWidth: 280 }}>
            {getResultDescription(results.percentage, pageType)}
          </T>
        </PastelCard>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Card style={{ flex: 1, gap: 4 }}>
            <T variant="caption">Correct</T>
            <T style={{ fontFamily: Fonts.display, fontSize: 28 }}>
              {results.correctCount}/{results.totalQuestions}
            </T>
          </Card>
          <Card style={{ flex: 1, gap: 4 }}>
            <T variant="caption">Accuracy</T>
            <T style={{ fontFamily: Fonts.display, fontSize: 28 }}>{results.percentage}%</T>
          </Card>
        </View>

        <View style={{ gap: 10, marginTop: 4 }}>
          {pageType !== "wrong" && <PillButton title="Retake" icon={RotateCcw} onPress={handleRetakeQuiz} />}
          <PillButton
            title={backUrl === "/" ? "Back to course" : "Back to topics"}
            icon={ArrowLeft}
            tone="soft"
            center
            onPress={() => handleBack(false)}
          />
          <PillButton title="Review answers" tone="soft" center onPress={() => setShowResults(false)} />
        </View>
      </ScrollView>
    </Animated.View>
  );
}
