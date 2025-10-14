import { View, Text } from "react-native";
import { ArrowLeft, Clock, RotateCcw } from "lucide-react-native";
import { Button } from "@/~/components/ui/button";
import QuestionNumberScroller from "./QuestionNumberScroller";
import TimeAlert from "./TimeAlert";
import { Question } from "@/types";
import { cn } from "@/lib/utils";
import { useEffect, useImperativeHandle, useState } from "react";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";

export interface QuizHeaderRef {
  startExam: () => void;
}

interface QuizHeaderProps {
  quizTitle: string;
  currentQuestionIndex: number;
  questions: Question[];
  answeredQuestions: Record<string, boolean>;
  pageType: string;
  currentIconColor: string;
  maxFreeIndex: number;
  toggleResetDialog: () => void;
  setCurrentQuestionIndex: (index: number) => void;
  setIsProModalOpen: (isOpen: boolean) => void;
  handleBack: (needSave?: boolean) => void;
  submitQuizResults: () => void;
  ref?: React.Ref<QuizHeaderRef>;
}

export default function QuizHeader({
  currentQuestionIndex,
  questions,
  answeredQuestions,
  pageType,
  currentIconColor,
  maxFreeIndex,
  toggleResetDialog,
  setCurrentQuestionIndex,
  setIsProModalOpen,
  handleBack,
  submitQuizResults,
  ref,
}: QuizHeaderProps) {
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const timeLimit = 70 * 60; // 70 minutes

  useImperativeHandle(ref, () => ({
    startExam() {
      setTimeSpent(0);
      setStartTime(Date.now());
      setIsExamStarted(true);
      setIsExamFinished(false);
    },
  }));

  useEffect(() => {
    if (!isExamStarted || isExamFinished) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeSpent(elapsed);

      if (pageType === "exam" && elapsed >= timeLimit) {
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, startTime, timeLimit, isExamFinished]);

  const handleAutoSubmit = () => {
    Toast.show({
      type: "error",
      text1: "Time’s up! The exam has been automatically submitted.",
      position: "top",
      visibilityTime: 2500,
      autoHide: true,
      topOffset: 60,
    });
    submitQuizResults();
  };

  const getBackButtonText = () => {
    if (Object.keys(answeredQuestions).length >= questions.length || pageType === "saved")
      return "Back to Topics";
    if (pageType === "exam") return "End Exam";
    return "Finish Later";
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const timeRemaining = Math.max(0, timeLimit - timeSpent);

  return (
    <View className="flex flex-col gap-y-4 mt-2 px-3">
      {/* Top Header */}
      <View className="flex flex-row w-full items-center justify-between">
        {/* Back Button with gradient */}
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          start={[0, 0]}
          end={[1, 1]}
          className="rounded-2xl overflow-hidden shadow-md shadow-blue-400/30"
        >
          <Button
            onPress={() => handleBack()}
            className="flex-row items-center bg-transparent px-3 py-2"
          >
            <ArrowLeft size={18} color="#fff" />
            <Text className="text-white font-semibold ml-2">
              {getBackButtonText()}
            </Text>
          </Button>
        </LinearGradient>

        {/* Reset or Timer */}
        {pageType !== "wrong" &&
          pageType !== "exam" &&
          Object.keys(answeredQuestions).length > 0 && (
            <Button
              onPress={toggleResetDialog}
              className="rounded-xl border border-blue-300/30 dark:border-blue-700/40 bg-white/80 dark:bg-[#1e293b] shadow-sm"
            >
              <RotateCcw size={20} color={currentIconColor || "#2563eb"} />
            </Button>
          )}

        {pageType === "exam" && (
          <View className="flex-row items-center gap-2 bg-white/90 dark:bg-[#1e293b] px-3 py-1.5 rounded-xl shadow-sm border border-blue-200/40 dark:border-blue-800/40">
            <Clock size={20} color="#2563eb" />
            <Text
              className={cn(
                "font-mono text-lg font-semibold",
                timeRemaining < 300 ? "text-red-600" : "text-blue-600",
                "dark:text-blue-400"
              )}
            >
              {formatTime(timeRemaining)}
            </Text>
          </View>
        )}
      </View>

      {/* Question Number Scroller */}
      <QuestionNumberScroller
        questions={questions}
        answeredQuestions={answeredQuestions}
        currentQuestionIndex={currentQuestionIndex}
        pageType={pageType}
        maxFreeIndex={maxFreeIndex}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        setIsProModalOpen={setIsProModalOpen}
      />

      {/* Alert for last 5 minutes */}
      {pageType === "exam" && timeRemaining < 300 && <TimeAlert />}
    </View>
  );
}
