import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react-native";
import { Button } from "@/~/components/ui/button";

interface ResultsCardProps {
  results: {
    passed: boolean;
    percentage: number;
    correctCount: number;
    totalQuestions: number;
  };
  pageType: "exam" | "topic" | "saved" | "random" | "wrong";
  backUrl: string;
  nextTopicUrl?: string;
  setIsResetDialogOpen: (open: boolean) => void;
  handleRetakeQuiz: () => void;
  handleBack: (needSave?: boolean) => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void; 
  isDark?: boolean;
}

export default function ResultsModal({
  results,
  pageType,
  backUrl,
  nextTopicUrl,
  setIsResetDialogOpen,
  handleRetakeQuiz,
  handleBack,
  showResults,
  setShowResults,
  isDark = false,
}: ResultsCardProps) {
  const router = useRouter();

  if (!showResults || !results) return null;

  return (
    <Animated.View
      entering={SlideInDown.delay(50)}
      exiting={SlideOutDown}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: isDark ? "#0f172a" : "#f8fafc",
        zIndex: 9999,
        paddingTop: 46,
      }}
    >
      {/* Header */}
      <LinearGradient
        colors={["#3b82f6", "#2563eb"]}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5,
          marginHorizontal: 12,
          marginRight: "auto",
          marginBottom: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => {handleBack(false); setShowResults(false);}}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <ArrowLeft size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
            Back to questions
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      >
        {/* Results Card */}
        <LinearGradient
          colors={
            results.passed
              ? [isDark ? "#2563eb" : "#60a5fa", isDark ? "#3b82f6" : "#3b82f6"]
              : pageType === "exam"
                ? ["#ef4444", "#dc2626"]
                : ["#f97316", "#f59e0b"]
          }
          start={[0, 0]}
          end={[1, 0]}
          style={{
            padding: 28,
            borderRadius: 16,
            marginBottom: 24,
            alignItems: "center",
          }}
        >
          {results.passed ? (
            <CheckCircle size={80} color="white" style={{ marginBottom: 16 }} />
          ) : (
            <AlertTriangle
              size={80}
              color="white"
              style={{ marginBottom: 16 }}
            />
          )}

          <Text
            style={{
              fontSize: 26,
              fontWeight: "800",
              color: "#fff",
              marginBottom: 4,
              textAlign: "center",
            }}
          >
            {results.passed
              ? pageType === "exam"
                ? "Exam Passed!"
                : "Well Done!"
              : pageType === "exam"
                ? "Unfortunately, you did not pass"
                : "Keep Going!"}
          </Text>

          <Text
            style={{
              fontSize: 15,
              color: "#fff",
              opacity: 0.9,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            {results.passed
              ? pageType === "exam"
                ? "Congratulations! You successfully completed the exam!"
                : "You successfully passed the test!"
              : pageType === "exam"
                ? "Try again after reviewing the material."
                : "Keep studying and improving!"}
          </Text>
        </LinearGradient>

        {/* Result Numbers */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginBottom: 24,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "600",
                color: isDark ? "#f8fafc" : "#111",
                marginBottom: 4,
              }}
            >
              {results.percentage}%
            </Text>
            <Text style={{ fontSize: 14, color: isDark ? "#ccc" : "#555" }}>
              Score
            </Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "600",
                color: isDark ? "#f8fafc" : "#111",
                marginBottom: 4,
              }}
            >
              {results.correctCount}/{results.totalQuestions}
            </Text>
            <Text style={{ fontSize: 14, color: isDark ? "#ccc" : "#555" }}>
              Correct
            </Text>
          </View>
        </View>

        {/* Buttons */}
        {/* Buttons */}
        <View
          style={{ flexDirection: "column", gap: 12, marginHorizontal: 12 }}
        >
          {/* Back Button */}
          <LinearGradient
            colors={["#3b82f6", "#2563eb"]}
            start={[0, 0]}
            end={[1, 1]}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => handleBack(false)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
              }}
            >
              <ArrowLeft size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {backUrl === "/course" ? "Back to Course" : "Back to Topics"}
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Next Topic Button */}
          {nextTopicUrl && pageType === "topic" && (
            <LinearGradient
              colors={["#3b82f6", "#2563eb"]}
              start={[0, 0]}
              end={[1, 1]}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 5,
                marginBottom: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => router.push(nextTopicUrl as any)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Go to Next Topic
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          )}

          {/* Retake Quiz Button */}
          {pageType !== "wrong" && (
            <LinearGradient
              colors={["#3b82f6", "#2563eb"]}
              start={[0, 0]}
              end={[1, 1]}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 5,
                marginBottom: 12,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (["saved", "random", "exam"].includes(pageType))
                    handleRetakeQuiz();
                  if (!["random", "exam"].includes(pageType))
                    setIsResetDialogOpen(true);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Retake Quiz
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
}
