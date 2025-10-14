import { ScrollView, Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";
import { Question } from "@/types";
import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useRef } from "react";

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
  setIsProModalOpen
}: QuestionNumberScrollerProps) {
    const {user} = useAuth()
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
            contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
            style={{ marginTop: 8, maxHeight: 50 }}
        >
        {questions.map((_, index) => {
            const questionId = questions[index].id;
            const isAnswered = questionId in answeredQuestions;;
            const isCorrect = answeredQuestions[questionId];
            const isLocked = pageType === "topic" && !user?.isPro && index > maxFreeIndex;

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


interface QuestionNumberButtonProps{
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
  const handlePress = () => {
    if (isLocked) {
      setIsProModalOpen(true);
      return;
    }
    setCurrentQuestionIndex(index);
  };

  return (
    <Pressable
      key={questionId}
      ref={(el) => {
        if (questionRef) questionRef = el;
      }}
      onPress={handlePress}
      className={cn(
        "w-12 h-10 rounded-xl flex items-center justify-center transition-all duration-150 shadow-sm",
        isCurrent && !isAnswered && "border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/40",
        isLocked
          ? "bg-gray-400/60 dark:bg-gray-700 opacity-60"
          : isAnswered
          ? isCorrect
            ? "bg-green-500"
            : "bg-red-500"
          : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
      )}
    >
      <Text
        className={cn(
          "text-sm font-semibold",
          isAnswered
            ? "text-white"
            : isCurrent
            ? "text-blue-700 dark:text-blue-300"
            : "text-gray-700 dark:text-gray-300"
        )}
      >
        {index + 1}
      </Text>
    </Pressable>
  );
};

