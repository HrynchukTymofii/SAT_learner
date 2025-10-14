import React from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { CheckCircle, XCircle } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Question } from "@/types";
import AutoHeightWebView from "react-native-autoheight-webview";

interface QuestionOptionsProps {
  currentQuestion: Question;
  selectedAnswers: Record<string, string[]>;
  isAnswered: boolean;
  pageType: string;
  handleAnswerSelect: (option: string) => void;
}

const QuestionOptions = ({
  currentQuestion,
  selectedAnswers,
  isAnswered,
  pageType,
  handleAnswerSelect,
}: QuestionOptionsProps) => {
  const [scale] = React.useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View className="gap-y-4 px-2">
      {currentQuestion.options.map((option, index) => {
        const isSelected =
          selectedAnswers[currentQuestion.id]?.includes(option) || false;
        const isCorrectOption = currentQuestion.answers.includes(option);

        const bgColor = !isAnswered
          ? isSelected
            ? "bg-blue-50 dark:bg-blue-900"
            : "bg-white dark:bg-slate-950"
          : isCorrectOption
          ? "bg-green-100 dark:bg-green-900"
          : isSelected
          ? "bg-red-100 dark:bg-red-900"
          : "bg-white dark:bg-slate-950";

        const borderColor = !isAnswered
          ? isSelected
            ? "border-blue-300 dark:border-blue-600"
            : "border-slate-300 dark:border-slate-700"
          : isCorrectOption
          ? "border-green-400 dark:border-green-500"
          : isSelected
          ? "border-red-400 dark:border-red-600"
          : "border-slate-300 dark:border-slate-700";

        return (
          <Animated.View key={index} style={{ transform: [{ scale }] }}>
            <Pressable
              onPress={() => !isAnswered && handleAnswerSelect(option)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              className={cn(
                "flex-row items-center gap-x-3 py-4 px-4 rounded-2xl border shadow-lg",
                bgColor,
                borderColor,
                pageType !== "saved" && !isAnswered && "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              {isAnswered && isCorrectOption && (
                <CheckCircle size={20} color="#16a34a" />
              )}
              {isAnswered && !isCorrectOption && isSelected && (
                <XCircle size={20} color="#dc2626" />
              )}
              <Text className="flex-1 text-black dark:text-white font-medium text-base">
                {option}
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
};

export default QuestionOptions;
