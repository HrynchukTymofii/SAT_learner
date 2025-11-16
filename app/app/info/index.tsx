import React from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookOpen, Calendar, Target, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function ArticlesPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const articles = [
    {
      title: "What is SAT?",
      description:
        "Learn about the SAT exam, its purpose, structure, and importance for college admissions.",
      icon: BookOpen,
      route: "info/articles/what-is-sat",
      bgColor: "#06B6D4",
      iconColor: "#ffffff",
    },
    {
      title: "How SAT is Scored",
      description:
        "Understand the SAT scoring system, score ranges, and how your performance is evaluated.",
      icon: Target,
      route: "info/articles/how-sat-scored",
      bgColor: "#10B981",
      iconColor: "#ffffff",
    },
    {
      title: "Test Dates & Registration",
      description:
        "Find out about SAT test dates, registration process, deadlines, and important information.",
      icon: Calendar,
      route: "info/articles/test-dates",
      bgColor: "#8B5CF6",
      iconColor: "#ffffff",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f9fafb" }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 12,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: isDark ? "#111827" : "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
      }}>
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
          <Text style={{ color: isDark ? "#06B6D4" : "#0891B2", fontWeight: "600", marginLeft: 6, fontSize: 14 }}>
            Back
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={{ fontSize: 24, fontWeight: "bold", color: isDark ? "#ffffff" : "#1f2937", marginBottom: 4 }}>
          SAT Resources
        </Text>
        <Text style={{ fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280" }}>
          Everything you need to know about the SAT exam
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {articles.map((article, index) => {
          const Icon = article.icon;
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => {router.push(article.route as any)}}
              style={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: article.bgColor,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Icon and Title */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: article.bgColor,
                  }}
                >
                  <Icon size={24} color={article.iconColor} />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    marginLeft: 12,
                    color: isDark ? "#ffffff" : "#1f2937",
                    flex: 1,
                  }}
                >
                  {article.title}
                </Text>
              </View>

              {/* Description */}
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  marginBottom: 12,
                  lineHeight: 20,
                }}
              >
                {article.description}
              </Text>

              {/* Learn More Badge */}
              <View
                style={{
                  backgroundColor: isDark ? "#0f172a" : "#f9fafb",
                  paddingVertical: 8,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: isDark ? "#06B6D4" : "#0891B2",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  Learn More
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
