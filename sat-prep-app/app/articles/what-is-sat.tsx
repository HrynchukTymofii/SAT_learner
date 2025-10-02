import React from "react";
import { ScrollView, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BookOpen, Clock, Users, Target, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function WhatIsSATPage({ navigation }: any) {
  const cardWidth = width > 400 ? (width - 48) / 2 : width - 32; // 2 cards per row on larger phones, 1 on small

  const quickFacts = [
    { icon: Clock, title: "3 hours", subtitle: "Test Duration", colors: ["#DBEAFE", "#BFDBFE"], iconColor: "#2563EB" },
    { icon: Target, title: "1600", subtitle: "Max Score", colors: ["#D1FAE5", "#A7F3D0"], iconColor: "#059669" },
    { icon: BookOpen, title: "2 Sections", subtitle: "Main Areas", colors: ["#EDE9FE", "#DDD6FE"], iconColor: "#7C3AED" },
    { icon: Users, title: "1.5M+", subtitle: "Annual Test Takers", colors: ["#FEF3C7", "#FDE68A"], iconColor: "#D97706" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-6 flex-row items-center gap-2 px-4 py-2 rounded-full border border-gray-300"
        >
          <ArrowLeft size={20} />
          <Text className="text-base font-medium">Back to Articles</Text>
        </TouchableOpacity>

        {/* Header */}
        <LinearGradient
          colors={["#3b82f6", "#8b5cf6"]}
          start={[0, 0]}
          end={[1, 0]}
          className="rounded-3xl p-6 mb-8 shadow-lg"
        >
          <View className="flex-row items-center gap-4">
            <View className="p-3 bg-white/20 rounded-full shadow">
              <BookOpen size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white mb-1">What is SAT?</Text>
              <Text className="text-blue-100 text-base">
                A comprehensive guide to understanding the SAT exam
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Facts */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-slate-900 mb-4">Quick Facts</Text>
          <View className="flex-row flex-wrap justify-between">
            {quickFacts.map((fact, i) => (
              <LinearGradient
                key={i}
                colors={fact.colors as [string, string]}
                style={{ width: cardWidth, minHeight: 120 }}
                className="rounded-3xl p-4 mb-4 justify-center items-center shadow"
              >
                <fact.icon size={28} color={fact.iconColor} />
                <Text className="font-bold text-slate-900 text-lg mt-2">{fact.title}</Text>
                <Text className="text-slate-700">{fact.subtitle}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Introduction */}
        <LinearGradient
          colors={["#ffffff", "#f9fafb"]}
          className="rounded-3xl shadow-lg p-6 mb-8"
        >
          <Text className="text-2xl font-bold text-slate-900 mb-4">Introduction to SAT</Text>
          <Text className="text-slate-700 leading-relaxed mb-4">
            The SAT (Scholastic Assessment Test) is a standardized test widely used for college admissions in the
            United States. Originally called the Scholastic Aptitude Test, the SAT is developed and administered by
            the College Board and is designed to assess a student's readiness for college.
          </Text>
          <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-inner">
            <Text className="font-semibold text-blue-900 mb-2">Key Purpose</Text>
            <Text className="text-blue-800">
              The SAT provides colleges with a common data point that can be used to compare all applicants,
              regardless of their high school background, curriculum, or grading standards.
            </Text>
          </View>
        </LinearGradient>

        {/* Test Structure */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-slate-900 mb-4">Test Structure</Text>
          <View className="flex-row flex-wrap gap-4">
            <LinearGradient
              colors={["#DBEAFE", "#BFDBFE"]}
              style={{ width: cardWidth }}
              className="rounded-3xl border border-blue-200 p-4 mb-4 shadow"
            >
              <Text className="text-xl font-semibold text-blue-900 mb-2">
                Evidence-Based Reading and Writing
              </Text>
              <Text className="text-blue-800">• Reading Test: 52 questions, 65 minutes</Text>
              <Text className="text-blue-800">• Writing and Language Test: 44 questions, 35 minutes</Text>
              <Text className="text-blue-800">• Score Range: 200-800</Text>
            </LinearGradient>

            <LinearGradient
              colors={["#D1FAE5", "#A7F3D0"]}
              style={{ width: cardWidth }}
              className="rounded-3xl border border-green-200 p-4 mb-4 shadow"
            >
              <Text className="text-xl font-semibold text-green-900 mb-2">Math</Text>
              <Text className="text-green-800">• Calculator Section: 38 questions, 55 minutes</Text>
              <Text className="text-green-800">• No Calculator Section: 20 questions, 25 minutes</Text>
              <Text className="text-green-800">• Score Range: 200-800</Text>
            </LinearGradient>
          </View>

          <View className="bg-amber-50 border border-amber-200 rounded-3xl p-4 shadow-inner">
            <Text className="font-semibold text-amber-900 mb-1">Optional Essay (Discontinued)</Text>
            <Text className="text-amber-800">
              As of June 2021, the College Board discontinued the optional SAT Essay. Most colleges no longer
              require or consider SAT Essay scores for admissions.
            </Text>
          </View>
        </View>

        {/* Navigation */}
        <View className="flex-row justify-between items-center mb-12">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center gap-2 px-4 py-2 rounded-full border border-gray-300"
          >
            <ArrowLeft size={20} />
            <Text>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("HowSATIsScored")}
            className="flex-row items-center gap-2 px-4 py-2 bg-blue-600 rounded-full shadow"
          >
            <Text className="text-white">Next: How SAT is Scored</Text>
            <ArrowLeft size={20} color="white" style={{ transform: [{ rotate: "180deg" }] }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
