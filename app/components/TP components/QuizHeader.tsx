import React from "react";
import { View, Animated } from "react-native";
import { Clock, RotateCcw, LayoutGrid, X } from "lucide-react-native";
import { Fonts, usePalette } from "@/constants/palette";
import { CircleButton, T } from "@/components/ds";
import TimeAlert from "./TimeAlert";
import { Question } from "@/types";
import { useEffect, useImperativeHandle, useState, useRef } from "react";
import Toast from "react-native-toast-message";

export interface QuizHeaderRef {
  startExam: () => void;
  getTimeElapsed: () => number;
  resumeExam: (elapsedSeconds: number) => void;
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
  toggleAllTasksDialog: () => void;
  setCurrentQuestionIndex: (index: number) => void;
  setIsProModalOpen: (isOpen: boolean) => void;
  handleBack: (needSave?: boolean) => void;
  submitQuizResults: () => void;
  ref?: React.Ref<QuizHeaderRef>;
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
  toggleAllTasksDialog,
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

  // Animation for glowing effect
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useImperativeHandle(ref, () => ({
    startExam() {
      setTimeSpent(0);
      setStartTime(Date.now());
      setIsExamStarted(true);
      setIsExamFinished(false);
    },
    getTimeElapsed() {
      return timeSpent;
    },
    resumeExam(elapsedSeconds: number) {
      setTimeSpent(elapsedSeconds);
      setStartTime(Date.now() - elapsedSeconds * 1000);
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

  // Check if quiz is completed
  const isQuizCompleted = Object.keys(answeredQuestions).length >= questions.length;

  // Glowing animation when quiz is completed
  useEffect(() => {
    if (isQuizCompleted && pageType !== "exam" && pageType !== "saved") {
      // Glow animation (for opacity)
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Bounce animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
      scaleAnim.setValue(1);
    }
  }, [isQuizCompleted, pageType]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const timeRemaining = Math.max(0, timeLimit - timeSpent);
  const c = usePalette();
  const answeredCount = Object.keys(answeredQuestions).length;
  const showTools = pageType !== "wrong" && pageType !== "exam" && answeredCount > 0;
  const closeLabel = isQuizCompleted || pageType === "saved" ? "Back" : pageType === "exam" ? "Stop exam" : "Finish later";
  const lowTime = timeRemaining < 300;

  // Pulses the grid / retake buttons once every question is answered
  const pulse = (child: React.ReactNode) =>
    isQuizCompleted && pageType !== "exam" && pageType !== "saved" ? (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>{child}</Animated.View>
    ) : (
      child
    );

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <CircleButton icon={X} label={closeLabel} onPress={() => handleBack()} />

        <View style={{ flex: 1, gap: 7 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            <T variant="smallStrong" color={c.muted}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </T>
            <T variant="caption" numberOfLines={1} style={{ flexShrink: 1, textAlign: "right" }}>
              {closeLabel === "Finish later" ? "Progress is saved" : ""}
            </T>
          </View>
          {questions.length <= 20 ? (
            <View style={{ flexDirection: "row", gap: 3 }}>
              {questions.map((q, i) => (
                <View
                  key={q.id}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 6,
                    backgroundColor: i === currentQuestionIndex ? c.lav2 : q.id in answeredQuestions ? c.ink : c.line,
                  }}
                />
              ))}
            </View>
          ) : (
            <View style={{ height: 6, borderRadius: 6, backgroundColor: c.line, overflow: "hidden" }}>
              <View style={{ width: `${(answeredCount / questions.length) * 100}%`, height: "100%", borderRadius: 6, backgroundColor: c.ink }} />
            </View>
          )}
        </View>

        {pageType === "exam" && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: lowTime ? c.rose : c.butter,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Clock size={15} color={c.onPastel} strokeWidth={2.2} />
            <T style={{ fontFamily: Fonts.bodyHeavy, fontSize: 13.5, fontVariant: ["tabular-nums"] }} onPastel>
              {formatTime(timeRemaining)}
            </T>
          </View>
        )}

        {showTools && pulse(<CircleButton icon={LayoutGrid} size={42} label="All questions" onPress={toggleAllTasksDialog} />)}
        {showTools && pulse(<CircleButton icon={RotateCcw} size={42} label="Start again" onPress={toggleResetDialog} />)}
      </View>

      {pageType === "exam" && lowTime && <TimeAlert />}
    </View>
  );
}
