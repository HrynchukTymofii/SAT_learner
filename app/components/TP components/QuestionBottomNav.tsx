import React from "react";
import { View } from "react-native";
import { ArrowLeft, ArrowRight, Check } from "lucide-react-native";
import { usePalette } from "@/constants/palette";
import { CircleButton, GUTTER, PillButton } from "@/components/ds";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface QuestionBottomNavProps {
  pageType: string;
  currentQuestionIndex: number;
  questions: { id: string }[];
  selectedAnswers: Record<string, string[]>;
  answeredQuestions: Record<string, boolean>;
  enableFinishSaved: boolean;
  isCompleted: boolean;
  isSubmitting: boolean;
  currentIconColor: string;
  previousQuestion: () => void;
  handleNextQuestion: () => void;
  finishReview: () => void;
}

export default function QuestionBottomNav({
  pageType,
  currentQuestionIndex,
  questions,
  selectedAnswers,
  answeredQuestions,
  enableFinishSaved,
  isSubmitting,
  isCompleted,
  previousQuestion,
  handleNextQuestion,
  finishReview,
}: QuestionBottomNavProps) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const wrap = {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: c.bg,
    paddingTop: 12,
    paddingBottom: insets.bottom + 14,
    paddingHorizontal: GUTTER,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  };

  if (isCompleted) {
    return (
      <View style={wrap}>
        <PillButton title="Finish review" icon={Check} onPress={finishReview} style={{ flex: 1 }} />
      </View>
    );
  }

  const label = getNextButtonLabel({ pageType, currentQuestionIndex, questions, selectedAnswers, answeredQuestions, enableFinishSaved });
  const isFinish = label.startsWith("Finish");

  return (
    <View style={wrap}>
      <View style={{ opacity: currentQuestionIndex === 0 ? 0.35 : 1 }}>
        <CircleButton icon={ArrowLeft} size={56} label="Previous question" onPress={currentQuestionIndex === 0 ? undefined : previousQuestion} />
      </View>
      <PillButton
        title={label}
        icon={isFinish ? Check : label === "Answer" ? Check : ArrowRight}
        loading={isSubmitting}
        onPress={handleNextQuestion}
        style={{ flex: 1 }}
      />
    </View>
  );
}

function getNextButtonLabel({
  pageType,
  currentQuestionIndex,
  questions,
  selectedAnswers,
  answeredQuestions,
  enableFinishSaved,
}: {
  pageType: string;
  currentQuestionIndex: number;
  questions: { id: string }[];
  selectedAnswers: Record<string, string[]>;
  answeredQuestions: Record<string, boolean>;
  enableFinishSaved: boolean;
}) {
  const questionId = questions[currentQuestionIndex].id;
  const selectedOption = selectedAnswers[questionId]?.[0];

  if (pageType === "exam") {
    const totalAnswered = Object.keys(answeredQuestions).length;

    if (
      totalAnswered === questions.length &&
      questionId in answeredQuestions &&
      selectedOption
    ) {
      return "Finish exam";
    }

    if (questionId in answeredQuestions) return "Next";
    if (selectedOption) return "Answer";
    return "Next";
  }

  if (Object.keys(answeredQuestions).length < questions.length) {
    return "Next";
  }
  if (currentQuestionIndex === questions.length - 1 && enableFinishSaved) {
    return "Finish review";
  }
  return "Finish test";
}
