import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { X, CheckCircle, XCircle, Circle } from "lucide-react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Question } from "@/types";

interface AllTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  answeredQuestions: Record<string, boolean>;
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
}

const AllTasksDialog = ({
  isOpen,
  onClose,
  questions,
  answeredQuestions,
  currentQuestionIndex,
  onQuestionSelect,
}: AllTasksDialogProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleQuestionPress = (index: number) => {
    onQuestionSelect(index);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: isDark ? "#17151C" : "#ffffff",
            borderRadius: 20,
            padding: 24,
            width: "100%",
            maxWidth: 500,
            maxHeight: "80%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: isDark ? "#2B2733" : "#E5DFEE",
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: isDark ? "#F4F1F8" : "#0B0A0F",
              }}
            >
              All Questions
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: isDark ? "#2B2733" : "#EFEAF7",
                borderRadius: 10,
                padding: 8,
              }}
            >
              <X size={24} color={isDark ? "#F4F1F8" : "#0B0A0F"} />
            </TouchableOpacity>
          </View>

          {/* Legend */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: 16,
              paddingHorizontal: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <CheckCircle size={16} color="#2E9A5E" />
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9C95A8" : "#6B6577",
                  fontWeight: "600",
                }}
              >
                Correct
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <XCircle size={16} color="#D93F55" />
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9C95A8" : "#6B6577",
                  fontWeight: "600",
                }}
              >
                Incorrect
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Circle size={16} color={isDark ? "#7E7889" : "#9C95A8"} />
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9C95A8" : "#6B6577",
                  fontWeight: "600",
                }}
              >
                Unanswered
              </Text>
            </View>
          </View>

          {/* Questions Grid */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: "100%" }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
                paddingBottom: 8,
              }}
            >
              {questions.map((question, index) => {
                const isAnswered = question.id in answeredQuestions;
                const isCorrect = answeredQuestions[question.id];
                const isCurrent = index === currentQuestionIndex;

                let bgColor, borderColor, icon;

                if (isCurrent) {
                  bgColor = isDark ? "#1e40af" : "#E4CDFF";
                  borderColor = "#8A5CE6";
                } else if (isAnswered) {
                  if (isCorrect) {
                    bgColor = isDark ? "#14532d" : "#dcfce7";
                    borderColor = "#2E9A5E";
                    icon = <CheckCircle size={16} color="#2E9A5E" />;
                  } else {
                    bgColor = isDark ? "#450a0a" : "#fee2e2";
                    borderColor = "#D93F55";
                    icon = <XCircle size={16} color="#D93F55" />;
                  }
                } else {
                  bgColor = isDark ? "#17151C" : "#ffffff";
                  borderColor = isDark ? "#3A3542" : "#D9D2E5";
                }

                return (
                  <Pressable
                    key={question.id}
                    onPress={() => handleQuestionPress(index)}
                    style={{
                      width: 60,
                      height: 60,
                      backgroundColor: bgColor,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: borderColor,
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    {/* Question Number */}
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: isCurrent
                          ? "#8A5CE6"
                          : isDark
                          ? "#F4F1F8"
                          : "#0B0A0F",
                      }}
                    >
                      {index + 1}
                    </Text>

                    {/* Status Icon */}
                    {icon && (
                      <View
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                        }}
                      >
                        {icon}
                      </View>
                    )}

                    {/* Current Indicator */}
                    {isCurrent && (
                      <View
                        style={{
                          position: "absolute",
                          bottom: 4,
                          left: 0,
                          right: 0,
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "#8A5CE6",
                          }}
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Summary */}
          <View
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: isDark ? "#2B2733" : "#E5DFEE",
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: isDark ? "#F4F1F8" : "#0B0A0F",
                }}
              >
                {Object.keys(answeredQuestions).length}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9C95A8" : "#6B6577",
                  marginTop: 2,
                }}
              >
                Answered
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: "#2E9A5E",
                }}
              >
                {
                  Object.values(answeredQuestions).filter((correct) => correct)
                    .length
                }
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9C95A8" : "#6B6577",
                  marginTop: 2,
                }}
              >
                Correct
              </Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "800",
                  color: "#D93F55",
                }}
              >
                {
                  Object.values(answeredQuestions).filter((correct) => !correct)
                    .length
                }
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9C95A8" : "#6B6577",
                  marginTop: 2,
                }}
              >
                Incorrect
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AllTasksDialog;
