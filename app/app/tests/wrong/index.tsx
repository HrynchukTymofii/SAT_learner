import React, { useEffect, useState, useCallback } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native"
import { useRouter, useFocusEffect } from "expo-router"
import { ArrowLeft, XCircle, RotateCcw, Search, X } from "lucide-react-native"
import { useAuth } from "@/context/AuthContext"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useQuizDatabase } from "@/lib/db/quiz"
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader"
import { useColorScheme } from "@/hooks/useColorScheme"
import { CircleCheck } from "lucide-react-native";
import { Play } from "lucide-react-native";
import { TestList } from "@/components/tests/TestList";
import { Loading, PillButton } from "@/components/ds";


export interface WrongQuiz {
  id: string
  title: string
  chapterTitle: string
  wrongCount: number
  questions: { question: string }[]
}

export default function WrongQuizzesScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const { fetchWrongQuizzesLocal } = useQuizDatabase();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const [quizzes, setQuizzes] = useState<WrongQuiz[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const loadQuizzes = useCallback(async () => {
    if (!token) {
      router.push("/login")
      return
    }
    setLoading(true)
    const res = await fetchWrongQuizzesLocal()
    if (res.success) {
      setQuizzes(res.quizzes)
    } else {
      console.warn("Failed to load wrong quizzes:", res.error)
    }
    setLoading(false)
  }, [token, fetchWrongQuizzesLocal, router])

  useEffect(() => {
    loadQuizzes()
  }, [])

  // Refresh wrong questions list when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadQuizzes()
    }, [])
  )

  if (loading) {
    return <Loading />;
  }

  const handleQuizClick = (quizId: string) => {
    router.push(`/tests/wrong/${quizId}` as any)
  }

  const handleTakeAllWrong = () => {
    router.push("/tests/wrong/all" as any)
  }

  const clearSearch = () => {
    setSearchTerm("");
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    searchTerm.length === 0
      ? true
      : quiz.questions.some((q) => q.question.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalWrong = quizzes.reduce((sum, quiz) => sum + quiz.wrongCount, 0)

  return (
    <TestList
      title="Your mistakes"
      subtitle="Every question you got wrong, grouped by quiz."
      search={searchTerm}
      onSearch={setSearchTerm}
      searchPlaceholder="Search questions"
      action={totalWrong > 0 ? <PillButton title={`Retry all ${totalWrong}`} icon={Play} onPress={handleTakeAllWrong} /> : undefined}
      items={filteredQuizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title.trim(),
        subtitle: `${quiz.wrongCount} wrong answer${quiz.wrongCount === 1 ? "" : "s"}`,
        tone: "rose" as const,
        onPress: () => handleQuizClick(quiz.id),
      }))}
      empty={{ icon: CircleCheck, title: "No mistakes to fix", text: "Questions you get wrong in tests will show up here." }}
    />
  );
}
