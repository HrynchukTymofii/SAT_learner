import React from "react";
import { Animated, Pressable, Text, TextInput, View } from "react-native";
import { CheckCircle, XCircle } from "lucide-react-native";
import { Question } from "@/types";
import { useColorScheme } from "@/hooks/useColorScheme";
import { isCorrect as isCorrectAnswer } from "@/components/quiz/quizLogic";

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
  const [gridInValue, setGridInValue] = React.useState("");
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

  // Initialize grid-in value from selectedAnswers
  React.useEffect(() => {
    if (currentQuestion.questionType === "grid_in") {
      const currentAnswer = selectedAnswers[currentQuestion.id]?.[0] || "";
      setGridInValue(currentAnswer);
    }
  }, [currentQuestion.id, selectedAnswers]);

  // Handle grid-in input submission
  const handleGridInSubmit = () => {
    if (gridInValue.trim()) {
      handleAnswerSelect(gridInValue.trim());
    }
  };

  // If this is a grid-in question, render input field
  if (currentQuestion.questionType === "grid_in") {
    const userAnswer = selectedAnswers[currentQuestion.id]?.[0];
    const correctAnswer = currentQuestion.answers[0];
    const isCorrect = isAnswered && isCorrectAnswer(currentQuestion.answers, userAnswer ? [userAnswer] : []);
    const isIncorrect = isAnswered && !isCorrect;

    return (
      <View style={{ gap: 16, paddingHorizontal: 8 }}>
        {/* Instructional Text */}
        {!isAnswered && <View
          style={{
            backgroundColor: isDark ? "#1e3a5f" : "#E4CDFF",
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 10,
            borderLeftWidth: 3,
            borderLeftColor: "#8A5CE6",
          }}
        >
          <Text
            style={{
              color: isDark ? "#93c5fd" : "#1e40af",
              fontSize: 10,
              fontWeight: "600",
            }}
          >
            💡 Write your answer as a decimal using a dot (e.g., 3.14 or 42)
          </Text>
        </View>}

        {/* Input Field Container */}
        <View style={{ gap: 12 }}>
          <TextInput
            style={{
              backgroundColor: isDark ? "#17151C" : "#ffffff",
              borderWidth: isAnswered ? 2 : 1,
              borderColor: isCorrect
                ? "#2E9A5E"
                : isIncorrect
                ? "#D93F55"
                : isDark
                ? "#2B2733"
                : "#E5DFEE",
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
              fontSize: 18,
              fontWeight: "500",
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
            placeholder="Enter your answer..."
            placeholderTextColor={isDark ? "#7E7889" : "#9C95A8"}
            value={gridInValue}
            onChangeText={setGridInValue}
            keyboardType="numeric"
            editable={!isAnswered}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Submit Button */}
          {!isAnswered && (
            <Pressable
              onPress={handleGridInSubmit}
              disabled={!gridInValue.trim()}
              style={{
                backgroundColor: gridInValue.trim()
                  ? "#8A5CE6"
                  : isDark
                  ? "#2B2733"
                  : "#E5DFEE",
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 12,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: gridInValue.trim()
                    ? "#ffffff"
                    : isDark
                    ? "#7E7889"
                    : "#9C95A8",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                Submit Answer
              </Text>
            </Pressable>
          )}

          {/* Feedback Display */}
          {isAnswered && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: isCorrect
                  ? isDark
                    ? "#14532d"
                    : "#dcfce7"
                  : isDark
                  ? "#450a0a"
                  : "#fee2e2",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isCorrect ? "#2E9A5E" : "#D93F55",
              }}
            >
              {isCorrect ? (
                <CheckCircle size={24} color="#2E9A5E" />
              ) : (
                <XCircle size={24} color="#D93F55" />
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: isDark ? "#F4F1F8" : "#0B0A0F",
                    fontSize: 15,
                    fontWeight: "600",
                  }}
                >
                  {isCorrect ? "Correct!" : "Incorrect"}
                </Text>
                {isIncorrect && (
                  <Text
                    style={{
                      color: isDark ? "#fca5a5" : "#D93F55",
                      fontSize: 14,
                      marginTop: 4,
                    }}
                  >
                    Correct answer: {correctAnswer}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }

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
                    ? (isDark ? "#17151C" : "#ffffff")
                    : (isDark ? "#17151C" : "#ffffff");
                  borderColor = isSelected ? "#8A5CE6" : (isDark ? "#2B2733" : "#E5DFEE");
                  borderWidth = isSelected ? 2 : 1;
                } else if (isCorrectOption) {
                  bgColor = isDark ? "#14532d" : "#dcfce7";
                  borderColor = "#2E9A5E";
                  borderWidth = 2;
                } else if (isSelected) {
                  bgColor = isDark ? "#450a0a" : "#fee2e2";
                  borderColor = "#D93F55";
                  borderWidth = 2;
                } else {
                  bgColor = isDark ? "#17151C" : "#ffffff";
                  borderColor = isDark ? "#2B2733" : "#E5DFEE";
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
                          color="#2E9A5E"
                          style={{ position: "absolute", top: 8, right: 8 }}
                        />
                      )}
                      {isAnswered && !isCorrectOption && isSelected && (
                        <XCircle
                          size={20}
                          color="#D93F55"
                          style={{ position: "absolute", top: 8, right: 8 }}
                        />
                      )}
                      <Text
                        style={{
                          color: isDark ? "#F4F1F8" : "#0B0A0F",
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
                    ? (isDark ? "#17151C" : "#ffffff")
                    : (isDark ? "#17151C" : "#ffffff");
                  borderColor = isSelected ? "#8A5CE6" : (isDark ? "#2B2733" : "#E5DFEE");
                  borderWidth = isSelected ? 2 : 1;
                } else if (isCorrectOption) {
                  bgColor = isDark ? "#14532d" : "#dcfce7";
                  borderColor = "#2E9A5E";
                  borderWidth = 2;
                } else if (isSelected) {
                  bgColor = isDark ? "#450a0a" : "#fee2e2";
                  borderColor = "#D93F55";
                  borderWidth = 2;
                } else {
                  bgColor = isDark ? "#17151C" : "#ffffff";
                  borderColor = isDark ? "#2B2733" : "#E5DFEE";
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
                          color="#2E9A5E"
                          style={{ position: "absolute", top: 8, right: 8 }}
                        />
                      )}
                      {isAnswered && !isCorrectOption && isSelected && (
                        <XCircle
                          size={20}
                          color="#D93F55"
                          style={{ position: "absolute", top: 8, right: 8 }}
                        />
                      )}
                      <Text
                        style={{
                          color: isDark ? "#F4F1F8" : "#0B0A0F",
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
            ? (isDark ? "#17151C" : "#ffffff")
            : (isDark ? "#17151C" : "#ffffff");
          borderColor = isSelected ? "#8A5CE6" : (isDark ? "#2B2733" : "#E5DFEE");
          borderWidth = isSelected ? 2 : 1;
        } else if (isCorrectOption) {
          bgColor = isDark ? "#14532d" : "#dcfce7";
          borderColor = "#2E9A5E";
          borderWidth = 2;
        } else if (isSelected) {
          bgColor = isDark ? "#450a0a" : "#fee2e2";
          borderColor = "#D93F55";
          borderWidth = 2;
        } else {
          bgColor = isDark ? "#17151C" : "#ffffff";
          borderColor = isDark ? "#2B2733" : "#E5DFEE";
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
                <CheckCircle size={20} color="#2E9A5E" />
              )}
              {isAnswered && !isCorrectOption && isSelected && (
                <XCircle size={20} color="#D93F55" />
              )}
              <Text style={{
                flex: 1,
                color: isDark ? "#F4F1F8" : "#0B0A0F",
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
