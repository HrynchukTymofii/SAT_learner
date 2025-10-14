import { useEffect, useState } from "react"
import { View, Text } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import {  fetchWrongQuestions } from "@/lib/api/quiz"
import { useAuth } from "@/context/AuthContext"
import TestsPage from "@/components/TestsPage"
import { useQuizDatabase } from "@/lib/db/quiz"
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader"

const WrongQuizScreen = () => {
  const { quizId } = useLocalSearchParams<{ quizId: string }>()
  const router = useRouter()
  const { token } = useAuth()
  const { fetchWrongQuestionsLocal } = useQuizDatabase();

  if (!token || !quizId) return null;

  const [quizData, setQuizData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quizId || !token) return

    const loadQuiz = async () => {
      try {
        const data = await fetchWrongQuestionsLocal(quizId)
        

        if (!data) {
          router.replace("/tests/wrong" as any)
          return
        }

        setQuizData(data)
      } catch (err) {
        setError("Не вдалося завантажити тест")
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [quizId, token])

  if (loading) {
    return (
      <GraduationCap3DLoader />
    );
  }

  if (error || !quizData) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error || "Something went wrong"}</Text>
      </View>
    )
  }

  return (
    <TestsPage
      quiz={{
        id: quizData.id,
        title: quizData.quizTitle,
        chapterId: quizData.chapterId,
        chapterTitle: quizData.chapterTitle,
        questions: quizData.questions,
      }}
      token={token}
      latestResult={quizData.latestResult}
      backUrl="/tests/wrong"
      nextTopicUrl={quizData.nextTopicUrl}
      pageType="wrong"
    />
  )
}

export default WrongQuizScreen
