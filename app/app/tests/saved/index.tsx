import React, { useEffect, useState, useCallback } from "react";
import { Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useFocusEffect } from "expo-router";
import { ArrowLeft, Heart, RotateCcw, Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuizDatabase } from "@/lib/db/quiz";
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Bookmark } from "lucide-react-native";
import { Play } from "lucide-react-native";
import { TestList } from "@/components/tests/TestList";
import { Loading, PillButton } from "@/components/ds";


export interface SavedQuiz {
  id: string;
  title: string;
  chapterTitle: string;
  savedCount: number;
  questions: any[];
}


export default function SavedQuizzesScreen() {
    const router = useRouter()
    const { token } = useAuth();
    const { fetchSavedQuizzesLocal } = useQuizDatabase();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const insets = useSafeAreaInsets();

    const [quizzes, setQuizzes] = useState<SavedQuiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

  const loadQuizzes = useCallback(async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetchSavedQuizzesLocal();
    if (res.success) {
      setQuizzes(res.quizzes ?? []);
    } else {
      console.warn("Failed to load saved quizzes:", res.error);
    }
    setLoading(false);
  }, [token, fetchSavedQuizzesLocal, router]);

  useEffect(() => {
    loadQuizzes();
  }, []);

  // Refresh saved questions list when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadQuizzes();
    }, [])
  );

  if (loading) {
    return <Loading />;
  }

  const handleQuizClick = (quizId: string) => {
    router.push(`/tests/saved/${quizId}` as any);
  };

  const handleTakeAllSaved = () => {
    router.push("/tests/saved/all" as any);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    if (!searchTerm) return true;
    return quiz.questions.some((question) =>
      question.question.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalSavedQuestions = quizzes.reduce(
    (sum, quiz) => sum + quiz.savedCount,
    0
  );

  return (
    <TestList
      title="Saved questions"
      subtitle="Questions you bookmarked for a second look."
      search={searchTerm}
      onSearch={setSearchTerm}
      searchPlaceholder="Search saved questions"
      action={totalSavedQuestions > 0 ? <PillButton title={`Practice all ${totalSavedQuestions}`} icon={Play} onPress={handleTakeAllSaved} /> : undefined}
      items={filteredQuizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title.trim(),
        subtitle: `${quiz.savedCount} saved question${quiz.savedCount === 1 ? "" : "s"}`,
        onPress: () => handleQuizClick(quiz.id),
      }))}
      empty={{ icon: Bookmark, title: "No saved questions yet", text: "Tap the bookmark on a question during a test to keep it here." }}
    />
  );
}
