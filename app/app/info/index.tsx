import React from "react";
import { ScrollView, Text, View, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookOpen, Calendar, Target, ArrowRight } from "lucide-react-native";

export default function ArticlesPage() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const articles = [
    {
      title: "What is SAT?",
      description:
        "Learn about the SAT exam, its purpose, structure, and importance for college admissions.",
      icon: BookOpen,
      route: "articles/what-is-sat",
      bgColor: "#3b82f6",
      iconColor: "#fff",
    },
    {
      title: "How SAT is Scored",
      description:
        "Understand the SAT scoring system, score ranges, and how your performance is evaluated.",
      icon: Target,
      route: "articles/how-sat-scored",
      bgColor: "#10b981",
      iconColor: "#fff",
    },
    {
      title: "Test Dates & Registration",
      description:
        "Find out about SAT test dates, registration process, deadlines, and important information.",
      icon: Calendar,
      route: "articles/test-dates",
      bgColor: "#8b5cf6",
      iconColor: "#fff",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={{ marginBottom: 16, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: isDark ? "#60a5fa" : "#2563eb",
              textAlign: "center",
            }}
          >
            SAT Resources
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#94a3b8" : "#6b7280",
              textAlign: "center",
              marginTop: 4,
              maxWidth: 350,
            }}
          >
            Everything you need to know about the SAT exam. From basics to advanced preparation strategies.
          </Text>
        </View>

        {/* Articles */}
        {articles.map((article, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            onPress={() => {}}
            style={{
              borderRadius: 24,
              overflow: "hidden",
              backgroundColor: isDark ? "#1e293b" : "#fff",
              marginBottom: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: article.bgColor,
                  }}
                >
                  <article.icon size={26} color={article.iconColor} />
                </View>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    marginLeft: 12,
                    color: isDark ? "#f1f5f9" : "#1f2937",
                  }}
                >
                  {article.title}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? "#cbd5e1" : "#475569",
                  marginBottom: 12,
                }}
              >
                {article.description}
              </Text>

              <View
                style={{
                  backgroundColor: isDark ? "#334155" : "#f1f5f9",
                  paddingVertical: 10,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: isDark ? "#60a5fa" : "#2563eb",
                    fontWeight: "600",
                  }}
                >
                  Learn More
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
