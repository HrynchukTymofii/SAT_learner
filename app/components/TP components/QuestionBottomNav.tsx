import React from "react";
import { View, Text, Pressable } from "react-native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { Button } from "@/~/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

interface QuestionBottomNavProps {
  pageType: string;
  currentQuestionIndex: number;
  questions: { id: string }[];
  selectedAnswers: Record<string, string[]>;
  answeredQuestions: Record<string, boolean>;
  enableFinishSaved: boolean;
  isCompleted: boolean;
  isSubmitting: boolean;
  isConfirmedAS: boolean;
  currentIconColor: string;
  currentQuestionId: string;
  previousQuestion: () => void;
  handleNextQuestion: () => void;
  setIsConfirmedAS: (state: boolean) => void;
  handleExamAnswerSelect: (option: string) => void;
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
  isConfirmedAS,
  currentIconColor,
  currentQuestionId,
  previousQuestion,
  handleNextQuestion,
  setIsConfirmedAS,
  handleExamAnswerSelect,
}: QuestionBottomNavProps) {
  const router = useRouter();
  if (isCompleted) {
    return (
      <View className="flex items-center mt-4 px-3">
        <Pressable
          onPress={() => router.back()}
          className="w-full rounded-2xl overflow-hidden shadow-md shadow-blue-400/30"
        >
          <LinearGradient
            colors={["#3b82f6", "#2563eb"]}
            start={[0, 0]}
            end={[1, 1]}
            style={{
              paddingVertical: 12,
              borderRadius: 16,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text className="text-white font-semibold text-base">
              Finish Review
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  // === Normal bottom nav ===
  return (
    <View className="flex flex-row justify-between items-center my-4 px-3 ">
      {/* Previous */}
      <Pressable
        onPress={previousQuestion}
        disabled={currentQuestionIndex === 0}
        className={cn(
          "rounded-2xl overflow-hidden shadow-md shadow-blue-400/30",
          currentQuestionIndex === 0 && "opacity-50"
        )}
      >
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          start={[0, 0]}
          end={[1, 1]}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
          }}
        >
          <ArrowLeft size={18} color="#fff" />
          <Text className="text-white font-semibold ml-2">Previous</Text>
        </LinearGradient>
      </Pressable>

      {/* Next / Answer / Finish */}
      <Pressable
        disabled={isSubmitting}
        onPress={() => {
          if (pageType === "exam") {
            const qId = questions[currentQuestionIndex].id;
            const selected = selectedAnswers[qId]?.[0];
            handleExamAnswerSelect(selected);
          }
          handleNextQuestion();
        }}
        className="rounded-2xl overflow-hidden shadow-md shadow-blue-400/30"
      >
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          start={[0, 0]}
          end={[1, 1]}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
          }}
        >
          {isSubmitting ? (
            <Text className="text-white font-semibold">Saving...</Text>
          ) : (
            <>
              <Text className="text-white font-semibold mr-2">
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
        </LinearGradient>
      </Pressable>
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
      totalAnswered === 5 &&
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
