import React from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Target, ArrowLeft, TrendingUp, Award, Check } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function HowSATScoredPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const scoreRanges = [
    {
      range: "1400-1600",
      label: "Excellent",
      description: "Competitive for top-tier universities",
      color: "#10B981",
    },
    {
      range: "1200-1390",
      label: "Good",
      description: "Strong for most colleges",
      color: "#06B6D4",
    },
    {
      range: "1000-1190",
      label: "Average",
      description: "Acceptable for many colleges",
      color: "#F59E0B",
    },
    {
      range: "Below 1000",
      label: "Below Average",
      description: "May need improvement",
      color: "#EF4444",
    },
  ];

  const scoringFacts = [
    "Each section (Math & EBRW) scored 200-800",
    "Total score is sum of both sections (400-1600)",
    "No penalty for wrong answers",
    "Raw score converted to scaled score",
    "Score reports include percentile rankings",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f9fafb" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 16,
          backgroundColor: isDark ? "#111827" : "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
        }}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
            borderRadius: 12,
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={isDark ? "#06B6D4" : "#0891B2"} />
          <Text
            style={{
              color: isDark ? "#06B6D4" : "#0891B2",
              fontWeight: "600",
              marginLeft: 6,
              fontSize: 14,
            }}
          >
            Back to Articles
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <View
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: "#10B981",
              marginRight: 12,
            }}
          >
            <Target size={24} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: isDark ? "#ffffff" : "#1f2937",
                marginBottom: 4,
              }}
            >
              How SAT is Scored
            </Text>
            <Text style={{ fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280" }}>
              Understanding the SAT scoring system
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Scoring Overview */}
        <View
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: "#10B981",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: isDark ? "#ffffff" : "#1f2937",
              marginBottom: 12,
            }}
          >
            Scoring Overview
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#9ca3af" : "#6b7280",
              lineHeight: 22,
              marginBottom: 16,
            }}
          >
            The SAT is scored on a scale of 400 to 1600, combining test results from two equally weighted sections: Math and Evidence-Based Reading and Writing (EBRW). Each section is scored on a scale of 200-800 points.
          </Text>

          {scoringFacts.map((fact, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <Check size={16} color="#10B981" style={{ marginRight: 8, marginTop: 2 }} />
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                {fact}
              </Text>
            </View>
          ))}
        </View>

        {/* Score Ranges */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: isDark ? "#ffffff" : "#1f2937",
              marginBottom: 16,
            }}
          >
            Score Ranges
          </Text>

          {scoreRanges.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: item.color,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: item.color,
                  }}
                >
                  {item.range}
                </Text>
                <View
                  style={{
                    backgroundColor: `${item.color}20`,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: item.color,
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  lineHeight: 20,
                }}
              >
                {item.description}
              </Text>
            </View>
          ))}
        </View>

        {/* How Scores are Calculated */}
        <View
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderLeftWidth: 4,
            borderLeftColor: "#06B6D4",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <TrendingUp size={20} color="#06B6D4" style={{ marginRight: 8 }} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: isDark ? "#ffffff" : "#1f2937",
              }}
            >
              How Scores are Calculated
            </Text>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isDark ? "#ffffff" : "#1f2937",
                marginBottom: 8,
              }}
            >
              1. Raw Score
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark ? "#9ca3af" : "#6b7280",
                lineHeight: 20,
                marginBottom: 12,
              }}
            >
              Your raw score is the number of questions you answered correctly. There's no penalty for wrong answers, so it's always better to guess than leave a question blank.
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isDark ? "#ffffff" : "#1f2937",
                marginBottom: 8,
              }}
            >
              2. Scaled Score
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark ? "#9ca3af" : "#6b7280",
                lineHeight: 20,
                marginBottom: 12,
              }}
            >
              Raw scores are converted to scaled scores (200-800 for each section) using an equating process that accounts for slight differences in difficulty across test versions.
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isDark ? "#ffffff" : "#1f2937",
                marginBottom: 8,
              }}
            >
              3. Total Score
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark ? "#9ca3af" : "#6b7280",
                lineHeight: 20,
              }}
            >
              Your total SAT score (400-1600) is the sum of your Math and Evidence-Based Reading and Writing section scores.
            </Text>
          </View>
        </View>

        {/* Percentile Rankings */}
        <View
          style={{
            backgroundColor: isDark ? "#1e293b" : "#fffbeb",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#fde68a",
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Award size={20} color={isDark ? "#fbbf24" : "#d97706"} style={{ marginRight: 8 }} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isDark ? "#fbbf24" : "#d97706",
              }}
            >
              Percentile Rankings
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#9ca3af" : "#78716c",
              lineHeight: 20,
            }}
          >
            Your score report includes percentile rankings showing how you performed compared to other test takers. For example, a 1300 score typically places you in the 87th percentile, meaning you scored higher than 87% of test takers.
          </Text>
        </View>

        {/* Next Article */}
        <TouchableOpacity
          onPress={() => router.push("/info/articles/test-dates" as any)}
          style={{
            backgroundColor: "#06B6D4",
            borderRadius: 16,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
            Next: Test Dates & Registration
          </Text>
          <ArrowLeft
            size={20}
            color="#ffffff"
            style={{ transform: [{ rotate: "180deg" }] }}
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
