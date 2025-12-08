import React from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { CheckCircle, XCircle } from "lucide-react-native";
import { Question } from "@/types";
import { useColorScheme } from "@/hooks/useColorScheme";

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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

  // Check if all options are short (10 characters or less)
  const allOptionsShort = currentQuestion.options.every(
    (option) => option.length <= 10
  );

  // If all options are short, display in 2 columns
  if (allOptionsShort) {
    return (
      <View style={{ gap: 16, paddingHorizontal: 8 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {/* Left column */}
          <View style={{ flex: 1, gap: 12 }}>
            {currentQuestion.options
              .filter((_, index) => index % 2 === 0)
              .map((option, idx) => {
                const index = idx * 2;
                const isSelected =
                  selectedAnswers[currentQuestion.id]?.includes(option) || false;
                const isCorrectOption = currentQuestion.answers.includes(option);

                let bgColor, borderColor, borderWidth;

                if (!isAnswered) {
                  bgColor = isSelected
                    ? (isDark ? "#1e293b" : "#ffffff")
                    : (isDark ? "#1e293b" : "#ffffff");
                  borderColor = isSelected ? "#06B6D4" : (isDark ? "#334155" : "#e5e7eb");
                  borderWidth = isSelected ? 2 : 1;
                } else if (isCorrectOption) {
                  bgColor = isDark ? "#14532d" : "#dcfce7";
                  borderColor = "#22c55e";
                  borderWidth = 2;
                } else if (isSelected) {
                  bgColor = isDark ? "#450a0a" : "#fee2e2";
                  borderColor = "#ef4444";
                  borderWidth = 2;
                } else {
                  bgColor = isDark ? "#1e293b" : "#ffffff";
                  borderColor = isDark ? "#334155" : "#e5e7eb";
                  borderWidth = 1;
                }

                return (
                  <Animated.View key={index} style={{ transform: [{ scale }] }}>
                    <Pressable
                      onPress={() => !isAnswered && handleAnswerSelect(option)}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        borderWidth,
                        borderColor,
                        backgroundColor: bgColor,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      {isAnswered && isCorrectOption && (
                        <CheckCircle
                          size={20}
                          color="#22c55e"
                          style={{ position: "absolute", top: 8, right: 8 }}
                        />
                      )}
                      {isAnswered && !isCorrectOption && isSelected && (
                        <XCircle
                          size={20}
                          color="#ef4444"
                          style={{ position: "absolute", top: 8, right: 8 }}
                        />
                      )}
                      <Text
                        style={{
                          color: isDark ? "#ffffff" : "#1f2937",
                          fontWeight: "400",
                          fontSize: 18,
                        }}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
          </View>

          {/* Right column */}
          <View style={{ flex: 1, gap: 12 }}>
            {currentQuestion.options
              .filter((_, index) => index % 2 === 1)
              .map((option, idx) => {
                const index = idx * 2 + 1;
                const isSelected =
                  selectedAnswers[currentQuestion.id]?.includes(option) || false;
                const isCorrectOption = currentQuestion.answers.includes(option);

                let bgColor, borderColor, borderWidth;

                if (!isAnswered) {
                  bgColor = isSelected
                    ? (isDark ? "#1e293b" : "#ffffff")
                    : (isDark ? "#1e293b" : "#ffffff");
                  borderColor = isSelected ? "#06B6D4" : (isDark ? "#334155" : "#e5e7eb");
                  borderWidth = isSelected ? 2 : 1;
                } else if (isCorrectOption) {
                  bgColor = isDark ? "#14532d" : "#dcfce7";
                  borderColor = "#22c55e";
                  borderWidth = 2;
                } else if (isSelected) {
                  bgColor = isDark ? "#450a0a" : "#fee2e2";
                  borderColor = "#ef4444";
                  borderWidth = 2;
                } else {
                  bgColor = isDark ? "#1e293b" : "#ffffff";
                  borderColor = isDark ? "#334155" : "#e5e7eb";
                  borderWidth = 1;
                }

                return (
                  <Animated.View key={index} style={{ transform: [{ scale }] }}>
                    <Pressable
                      onPress={() => !isAnswered && handleAnswerSelect(option)}
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderRadius: 12,
                        borderWidth,
                        borderColor,
                        backgroundColor: bgColor,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                      }}
                    >
                      {isAnswered && isCorrectOption && (
                        <CheckCircle
                          size={20}
                          color="#22c55e"
                          style={{ position: "absolute", top: 8, right: 8 }}
                        />
                      )}
                      {isAnswered && !isCorrectOption && isSelected && (
                        <XCircle
                          size={20}
                          color="#ef4444"
                          style={{ position: "absolute", top: 8, right: 8 }}
                        />
                      )}
                      <Text
                        style={{
                          color: isDark ? "#ffffff" : "#1f2937",
                          fontWeight: "400",
                          fontSize: 18,
                        }}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
          </View>
        </View>
      </View>
    );
  }

  // Default single column layout for longer options
  return (
    <View style={{ gap: 16, paddingHorizontal: 8 }}>
      {currentQuestion.options.map((option, index) => {
        const isSelected =
          selectedAnswers[currentQuestion.id]?.includes(option) || false;
        const isCorrectOption = currentQuestion.answers.includes(option);

        let bgColor, borderColor, borderWidth;

        if (!isAnswered) {
          bgColor = isSelected
            ? (isDark ? "#1e293b" : "#ffffff")
            : (isDark ? "#1e293b" : "#ffffff");
          borderColor = isSelected ? "#06B6D4" : (isDark ? "#334155" : "#e5e7eb");
          borderWidth = isSelected ? 2 : 1;
        } else if (isCorrectOption) {
          bgColor = isDark ? "#14532d" : "#dcfce7";
          borderColor = "#22c55e";
          borderWidth = 2;
        } else if (isSelected) {
          bgColor = isDark ? "#450a0a" : "#fee2e2";
          borderColor = "#ef4444";
          borderWidth = 2;
        } else {
          bgColor = isDark ? "#1e293b" : "#ffffff";
          borderColor = isDark ? "#334155" : "#e5e7eb";
          borderWidth = 1;
        }

        return (
          <Animated.View key={index} style={{ transform: [{ scale }] }}>
            <Pressable
              onPress={() => !isAnswered && handleAnswerSelect(option)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth,
                borderColor,
                backgroundColor: bgColor,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {isAnswered && isCorrectOption && (
                <CheckCircle size={20} color="#22c55e" />
              )}
              {isAnswered && !isCorrectOption && isSelected && (
                <XCircle size={20} color="#ef4444" />
              )}
              <Text style={{
                flex: 1,
                color: isDark ? "#ffffff" : "#1f2937",
                fontWeight: "500",
                fontSize: 15,
                lineHeight: 22,
              }}>
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
