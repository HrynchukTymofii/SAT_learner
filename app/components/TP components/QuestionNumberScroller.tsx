import { ScrollView, Pressable, Text, View } from "react-native";
import { Question } from "@/types";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useRef } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";

interface QuestionNumberScrollerProps {
  questions: Question[];
  answeredQuestions: Record<string, boolean>;
  currentQuestionIndex: number;
  pageType: string;
  maxFreeIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  setIsProModalOpen: (isOpen: boolean) => void;
}

export default function QuestionNumberScroller({
  questions,
  answeredQuestions,
  currentQuestionIndex,
  pageType,
  maxFreeIndex,
  setCurrentQuestionIndex,
  setIsProModalOpen,
}: QuestionNumberScrollerProps) {
  const { user } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const questionRefs = useRef<(View | null)[]>([]);

  useEffect(() => {
    const index = currentQuestionIndex;
    if (index >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ x: index * 48, animated: true });
    }
  }, [currentQuestionIndex]);
  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
      style={{ marginTop: 8, maxHeight: 50 }}
    >
      {questions.map((_, index) => {
        const questionId = questions[index].id;
        const isAnswered = questionId in answeredQuestions;
        const isCorrect = answeredQuestions[questionId];
        const isLocked =
          pageType === "topic" && !user?.isPro && index > maxFreeIndex;

        return (
          <QuestionNumberButton
            key={index}
            index={index}
            isCurrent={currentQuestionIndex === index}
            questionId={questionId}
            questionRef={questionRefs.current[index]}
            isLocked={isLocked}
            isCorrect={isCorrect}
            isAnswered={isAnswered}
            setIsProModalOpen={setIsProModalOpen}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
          />
        );
      })}
    </ScrollView>
  );
}

interface QuestionNumberButtonProps {
  index: number;
  isCurrent: boolean;
  questionId: string;
  questionRef: View | null;
  isLocked: boolean;
  isAnswered: boolean;
  isCorrect: boolean;
  setIsProModalOpen: (isOpen: boolean) => void;
  setCurrentQuestionIndex: (index: number) => void;
}

const QuestionNumberButton = ({
  index,
  isCurrent,
  questionId,
  questionRef,
  isLocked,
  isAnswered,
  isCorrect,
  setIsProModalOpen,
  setCurrentQuestionIndex,
}: QuestionNumberButtonProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handlePress = () => {
    if (isLocked) {
      //console.log("isLockedNB");
      setIsProModalOpen(true);
      return;
    }
    setCurrentQuestionIndex(index);
  };

  let backgroundColor, borderColor, borderWidth, textColor;

  if (isLocked) {
    backgroundColor = isDark ? "#2B2733" : "#9C95A8";
    borderColor = "transparent";
    borderWidth = 0;
    textColor = isDark ? "#7E7889" : "#E5DFEE";
  } else if (isAnswered) {
    backgroundColor = isCorrect ? "#2E9A5E" : "#D93F55";
    borderColor = "transparent";
    borderWidth = 0;
    textColor = "#ffffff";
  } else if (isCurrent) {
    backgroundColor = isDark ? "#17151C" : "#ffffff";
    borderColor = "#8A5CE6";
    borderWidth = 2;
    textColor = "#8A5CE6";
  } else {
    backgroundColor = isDark ? "#17151C" : "#EFEAF7";
    borderColor = isDark ? "#2B2733" : "#E5DFEE";
    borderWidth = 1;
    textColor = isDark ? "#9C95A8" : "#6B6577";
  }

  return (
    <Pressable
      key={questionId}
      ref={(el) => {
        if (questionRef) questionRef = el;
      }}
      onPress={handlePress}
      style={{
        width: 48,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor,
        borderWidth,
        borderColor,
        opacity: isLocked ? 0.6 : 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: textColor,
        }}
      >
        {index + 1}
      </Text>
    </Pressable>
  );
};
