import React from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookOpen, Calendar, Target, ArrowRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

export default function ArticlesPage() {
  const navigation = useNavigation();

  const articles = [
    {
      title: "What is SAT?",
      description:
        "Learn about the SAT exam, its purpose, structure, and importance for college admissions.",
      icon: BookOpen,
      route: "articles/what-is-sat",
      colors: ["#3b82f6", "#8b5cf6"], // Blue to Purple
    },
    {
      title: "How SAT is Scored",
      description:
        "Understand the SAT scoring system, score ranges, and how your performance is evaluated.",
      icon: Target,
      route: "articles/what-is-sat",
      colors: ["#10b981", "#3b82f6"], // Green to Blue
    },
    {
      title: "Test Dates & Registration",
      description:
        "Find out about SAT test dates, registration process, deadlines, and important information.",
      icon: Calendar,
      route: "articles/what-is-sat",
      colors: ["#8b5cf6", "#ec4899"], // Purple to Pink
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View className="mb-8 items-center">
          <Text className="text-3xl font-bold text-slate-900 mb-2 text-center">
            SAT Resources
          </Text>
          <Text className="text-lg text-slate-600 text-center max-w-md">
            Everything you need to know about the SAT exam. From basics to advanced preparation strategies.
          </Text>
        </View>

        {/* Articles */}
        {articles.map((article, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(article.route as never)}
            className="mb-6 rounded-xl overflow-hidden shadow-lg"
          >
            {/* Gradient top bar */}
            <LinearGradient
              colors={article.colors  as [string, string]}
              start={[0, 0]}
              end={[1, 0]}
              className="h-2 w-full"
            />

            {/* Card content */}
            <View className="bg-white p-4 space-y-3">
              <View className="flex-row items-center gap-3 mb-2">
                <View
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: article.colors[0] }}
                >
                  <article.icon size={24} color="white" />
                </View>
                <Text className="text-xl font-bold text-slate-900">
                  {article.title}
                </Text>
              </View>

              <Text className="text-slate-600">{article.description}</Text>

              <View className="flex-row justify-end">
                <ArrowRight size={20} color="#3b82f6" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
