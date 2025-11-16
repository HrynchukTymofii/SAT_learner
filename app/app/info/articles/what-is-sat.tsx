import React from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookOpen, Clock, Users, Target, ArrowLeft, Check } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function WhatIsSATPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const quickFacts = [
    {
      icon: Clock,
      title: "3 hours",
      subtitle: "Test Duration",
      bgColor: isDark ? "#1e293b" : "#ffffff",
      iconColor: "#06B6D4",
    },
    {
      icon: Target,
      title: "1600",
      subtitle: "Max Score",
      bgColor: isDark ? "#1e293b" : "#ffffff",
      iconColor: "#10B981",
    },
    {
      icon: BookOpen,
      title: "2 Sections",
      subtitle: "Main Areas",
      bgColor: isDark ? "#1e293b" : "#ffffff",
      iconColor: "#8B5CF6",
    },
    {
      icon: Users,
      title: "1.5M+",
      subtitle: "Annual Test Takers",
      bgColor: isDark ? "#1e293b" : "#ffffff",
      iconColor: "#F59E0B",
    },
  ];

  const sections = [
    {
      title: "Evidence-Based Reading and Writing",
      items: [
        "Reading Test: 52 questions, 65 minutes",
        "Writing and Language Test: 44 questions, 35 minutes",
        "Score Range: 200-800",
      ],
      color: "#06B6D4",
    },
    {
      title: "Math",
      items: [
        "Calculator Section: 38 questions, 55 minutes",
        "No Calculator Section: 20 questions, 25 minutes",
        "Score Range: 200-800",
      ],
      color: "#10B981",
    },
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
              backgroundColor: "#06B6D4",
              marginRight: 12,
            }}
          >
            <BookOpen size={24} color="#ffffff" />
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
              What is SAT?
            </Text>
            <Text style={{ fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280" }}>
              A comprehensive guide to the SAT exam
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Facts */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: isDark ? "#ffffff" : "#1f2937",
              marginBottom: 16,
            }}
          >
            Quick Facts
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            {quickFacts.map((fact, i) => {
              const Icon = fact.icon;
              return (
                <View
                  key={i}
                  style={{
                    width: "48%",
                    backgroundColor: fact.bgColor,
                    borderRadius: 16,
                    padding: 20,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: isDark ? "#334155" : "#e5e7eb",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <Icon size={32} color={fact.iconColor} style={{ marginBottom: 8 }} />
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: isDark ? "#ffffff" : "#1f2937",
                      marginBottom: 4,
                    }}
                  >
                    {fact.title}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: isDark ? "#9ca3af" : "#6b7280",
                      textAlign: "center",
                    }}
                  >
                    {fact.subtitle}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Introduction */}
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
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: isDark ? "#ffffff" : "#1f2937",
              marginBottom: 12,
            }}
          >
            Introduction to SAT
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#9ca3af" : "#6b7280",
              lineHeight: 22,
              marginBottom: 16,
            }}
          >
            The SAT (Scholastic Assessment Test) is a standardized test widely used for
            college admissions in the United States. Originally called the Scholastic
            Aptitude Test, the SAT is developed and administered by the College Board and is
            designed to assess a student's readiness for college.
          </Text>
          <View
            style={{
              backgroundColor: isDark ? "#0f172a" : "#f0f9ff",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#bae6fd",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isDark ? "#06B6D4" : "#0891B2",
                marginBottom: 8,
              }}
            >
              Key Purpose
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: isDark ? "#9ca3af" : "#6b7280",
                lineHeight: 20,
              }}
            >
              The SAT provides colleges with a common data point that can be used to compare
              all applicants, regardless of their high school background, curriculum, or
              grading standards.
            </Text>
          </View>
        </View>

        {/* Test Structure */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: isDark ? "#ffffff" : "#1f2937",
              marginBottom: 16,
            }}
          >
            Test Structure
          </Text>

          {sections.map((section, index) => (
            <View
              key={index}
              style={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: section.color,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: isDark ? "#ffffff" : "#1f2937",
                  marginBottom: 12,
                }}
              >
                {section.title}
              </Text>
              {section.items.map((item, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <Check size={16} color={section.color} style={{ marginRight: 8, marginTop: 2 }} />
                  <Text
                    style={{
                      fontSize: 14,
                      color: isDark ? "#9ca3af" : "#6b7280",
                      flex: 1,
                      lineHeight: 20,
                    }}
                  >
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Important Note */}
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
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: isDark ? "#fbbf24" : "#d97706",
              marginBottom: 8,
            }}
          >
            Optional Essay (Discontinued)
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#9ca3af" : "#78716c",
              lineHeight: 20,
            }}
          >
            As of June 2021, the College Board discontinued the optional SAT Essay. Most
            colleges no longer require or consider SAT Essay scores for admissions.
          </Text>
        </View>

        {/* Next Article */}
        <TouchableOpacity
          onPress={() => router.push("/info/articles/how-sat-scored" as any)}
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
            Next: How SAT is Scored
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
