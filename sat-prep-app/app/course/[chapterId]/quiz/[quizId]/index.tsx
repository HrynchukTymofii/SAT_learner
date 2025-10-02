import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  useColorScheme,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AutoHeightWebView from "react-native-autoheight-webview";
import { useAuth } from "@/context/AuthContext";
import { fetchQuiz } from "@/lib/api/course";
import TopBlur from "@/components/ui/TobBlur";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answers: string[];
  position: number;
};

export default function QuizPage() {
  const router = useRouter();
  const { chapterId, quizId } = useLocalSearchParams<{
    chapterId: string;
    quizId: string;
  }>();
  const { token } = useAuth();

  const [quiz, setQuiz] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { width: containerWidth } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const [webViewLoading, setWebViewLoading] = useState(true);

  useEffect(() => {
    if (!token || !quizId) return;
    const load = async () => {
      setLoading(true);
      const res = await fetchQuiz(quizId, token);
      if (res.success) setQuiz(res.data);
      setLoading(false);
    };
    load();
  }, [quizId, token]);

  if (loading || !quiz) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </SafeAreaView>
    );
  }

  const questions: QuizQuestion[] = quiz.questions;
  const question = questions[currentIndex];

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      // Quiz complete, navigate or submit
      alert("Quiz completed!");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TopBlur />
      <View className="p-4 border-b border-gray-200">
        <Text className="text-lg font-semibold">
          Question {currentIndex + 1} of {questions.length}
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* AutoHeightWebView */}
        <AutoHeightWebView
          source={{
            uri: `https://sat-ecosystem.vercel.app/expo-course/${chapterId}/quizzes/${quizId}/question/${question.id}`,
          }}
          viewportContent="width=device-width, user-scalable=no"
          scalesPageToFit={true}
          style={{ width: containerWidth || "100%", minHeight: 150 }}
          scrollEnabled={false} // AutoHeightWebView calculates height automatically
          onLoadStart={() => setWebViewLoading(true)}
          onLoadEnd={() => setWebViewLoading(false)}
        />

        {/* Options + Navigation */}
        <View className="p-4 ">
          {question.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              className={`mb-3 p-4 rounded-lg border ${
                selectedOption === opt
                  ? "border-blue-600 bg-blue-100"
                  : "border-gray-300"
              }`}
              onPress={() => setSelectedOption(opt)}
            >
              <Text className="text-gray-800">{opt}</Text>
            </TouchableOpacity>
          ))}

          <View className="flex-row justify-between mt-4">
            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentIndex === 0}
              className={`px-4 py-3 rounded-lg ${
                currentIndex === 0 ? "bg-gray-300" : "bg-gray-600"
              }`}
            >
              <Text className="text-white">Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              className="px-4 py-3 rounded-lg bg-blue-600"
            >
              <Text className="text-white">
                {currentIndex === questions.length - 1 ? "Finish" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
