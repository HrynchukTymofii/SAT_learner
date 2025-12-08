import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft, Clock, RotateCcw } from "lucide-react-native";
import QuestionNumberScroller from "./QuestionNumberScroller";
import TimeAlert from "./TimeAlert";
import { Question } from "@/types";
import { useEffect, useImperativeHandle, useState } from "react";
import Toast from "react-native-toast-message";
import { useColorScheme } from "@/hooks/useColorScheme";
import { TourTooltip } from "@/components/Tour/TourTooltip";
import { TOUR_STEPS, TOTAL_TOUR_STEPS, getTourStepInfo } from "@/constants/tourSteps";

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
  // Tour props
  tourActive?: boolean;
  currentStep?: number;
  handleTourNext?: () => void;
  handleTourPrev?: () => void;
  skipTour?: () => void;
  isNumbersQuiz?: boolean;
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
  tourActive = false,
  currentStep = 0,
  handleTourNext = () => {},
  handleTourPrev = () => {},
  skipTour = () => {},
  isNumbersQuiz = false,
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
    if (
      Object.keys(answeredQuestions).length >= questions.length ||
      pageType === "saved"
    )
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View style={{ flexDirection: "column", gap: 8, marginTop: 8, paddingHorizontal: 12 }}>
      {/* Top Header */}
      <View style={{ flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => handleBack()}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? "#374155" : "#e5e7eb",
          }}
        >
          <ArrowLeft size={18} color={isDark ? "#06B6D4" : "#0891B2"} />
          <Text style={{
            color: isDark ? "#06B6D4" : "#0891B2",
            fontWeight: "600",
            marginLeft: 8,
            fontSize: 14
          }}>
            {getBackButtonText()}
          </Text>
        </TouchableOpacity>

        {/* Reset or Timer */}
        {pageType !== "wrong" &&
          pageType !== "exam" &&
          Object.keys(answeredQuestions).length > 0 && (
            tourActive && currentStep === TOUR_STEPS.RESTART_TEST && isNumbersQuiz ? (
              <TourTooltip
                visible={true}
                onNext={handleTourNext}
                onPrev={handleTourPrev}
                onSkip={skipTour}
                onClose={() => {}}
                title={getTourStepInfo(TOUR_STEPS.RESTART_TEST).title}
                content={getTourStepInfo(TOUR_STEPS.RESTART_TEST).content}
                stepNumber={TOUR_STEPS.RESTART_TEST + 1}
                totalSteps={TOTAL_TOUR_STEPS}
                placement="bottom"
              >
                <TouchableOpacity
                  onPress={toggleResetDialog}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
                    padding: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isDark ? "#374155" : "#e5e7eb",
                  }}
                >
                  <RotateCcw size={20} color={isDark ? "#06B6D4" : "#0891B2"} />
                </TouchableOpacity>
              </TourTooltip>
            ) : (
              <TouchableOpacity
                onPress={toggleResetDialog}
                activeOpacity={0.7}
                style={{
                  backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
                  padding: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#374155" : "#e5e7eb",
                }}
              >
                <RotateCcw size={20} color={isDark ? "#06B6D4" : "#0891B2"} />
              </TouchableOpacity>
            )
          )}

        {pageType === "exam" && (
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: timeRemaining < 300 ? "#ef4444" : (isDark ? "#374155" : "#e5e7eb"),
          }}>
            <Clock size={20} color={timeRemaining < 300 ? "#ef4444" : "#06B6D4"} />
            <Text style={{
              fontFamily: "monospace",
              fontSize: 16,
              fontWeight: "600",
              color: timeRemaining < 300 ? "#ef4444" : (isDark ? "#06B6D4" : "#0891B2"),
            }}>
              {formatTime(timeRemaining)}
            </Text>
          </View>
        )}
      </View>

      {/* Question Number Scroller */}
      {/* <QuestionNumberScroller
        questions={questions}
        answeredQuestions={answeredQuestions}
        currentQuestionIndex={currentQuestionIndex}
        pageType={pageType}
        maxFreeIndex={maxFreeIndex}
        setCurrentQuestionIndex={setCurrentQuestionIndex}
        setIsProModalOpen={setIsProModalOpen}
      /> */}

      {/* Alert for last 5 minutes */}
      {pageType === "exam" && timeRemaining < 300 && <TimeAlert />}
    </View>
  );
}
