import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
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
  currentIconColor,
  previousQuestion,
  handleNextQuestion,
  finishReview,
}: QuestionBottomNavProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  if (isCompleted) {
    return (
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: isDark ? "#0B0A0F" : "#ffffff",
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 16,
          borderTopWidth: 1,
          borderTopColor: isDark ? "#17151C" : "#E5DFEE",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <TouchableOpacity
          onPress={finishReview}
          activeOpacity={0.7}
          style={{
            width: "100%",
            backgroundColor: "#8A5CE6",
            paddingVertical: 16,
            borderRadius: 12,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            shadowColor: "#8A5CE6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 16 }}>
            Finish Review
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // === Normal bottom nav ===
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: isDark ? "#0B0A0F" : "#ffffff",
        paddingTop: 16,
        paddingBottom: insets.bottom + 16,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: isDark ? "#17151C" : "#E5DFEE",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Previous */}
      <TouchableOpacity
        onPress={previousQuestion}
        disabled={currentQuestionIndex === 0}
        activeOpacity={0.7}
        style={{
          backgroundColor: isDark ? "#17151C" : "#EFEAF7",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          opacity: currentQuestionIndex === 0 ? 0.4 : 1,
          borderWidth: 1,
          borderColor: isDark ? "#2B2733" : "#E5DFEE",
        }}
      >
        <ArrowLeft size={18} color={isDark ? "#C9AAFB" : "#7A4BDB"} />
        <Text
          style={{
            color: isDark ? "#C9AAFB" : "#7A4BDB",
            fontWeight: "600",
            marginLeft: 8,
          }}
        >
          Previous
        </Text>
      </TouchableOpacity>

      {/* Next / Answer / Finish */}
      <TouchableOpacity
        disabled={isSubmitting}
        onPress={handleNextQuestion}
        activeOpacity={0.7}
        style={{
          backgroundColor: isSubmitting
            ? isDark
              ? "#2B2733"
              : "#D9D2E5"
            : "#8A5CE6",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: isSubmitting ? "#000" : "#8A5CE6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Text
              style={{
                color: "#ffffff",
                fontWeight: "700",
                marginRight: 8,
              }}
            >
              {getNextButtonLabel({
                pageType,
                currentQuestionIndex,
                questions,
                selectedAnswers,
                answeredQuestions,
                enableFinishSaved,
              })}
            </Text>
            {!(
              pageType === "exam" &&
              selectedAnswers[questions[currentQuestionIndex].id]?.[0]
            ) && <ArrowRight size={18} color="#fff" />}
          </>
        )}
      </TouchableOpacity>
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
      return "Finish Exam";
    }

    if (questionId in answeredQuestions) return "Next";
    if (selectedOption) return "Answer";
    return "Next";
  }

  if (Object.keys(answeredQuestions).length < questions.length) {
    return "Next";
  }
  if (currentQuestionIndex === questions.length - 1 && enableFinishSaved) {
    return "Finish Review";
  }
  return "Finish Test";
}
