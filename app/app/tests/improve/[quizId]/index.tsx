import { useEffect, useState } from "react"
import { View, Text } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { fetchQuizById } from "@/lib/api/quiz"
import { useAuth } from "@/context/AuthContext"
import TestsPage from "@/components/TestsPage"
import { useQuizDatabase } from "@/lib/db/quiz"
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader"

const ImproveScreen = () => {
  const { quizId } = useLocalSearchParams<{ quizId: string }>()
  const router = useRouter()
  const { token } = useAuth()
  const { fetchQuizByIdLocal } = useQuizDatabase();

  const [quizData, setQuizData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quizId || !token) return

    const loadQuiz = async () => {
      try {
        const data = await fetchQuizByIdLocal(quizId);

        //const data = await fetchQuizById(quizId, token)

        if (!data) {
          router.replace("/tests/by-topic" as any)
          return
        }

        setQuizData(data)
      } catch (err) {
        setError("Failed to download the test")
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [quizId, token])


  if (loading || !token || !quizId) {
    return (
      <GraduationCap3DLoader />
    );
  }

  if (error || !quizData) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error || "Something went wrong("}</Text>
      </View>
    )
  }

  return (
    <TestsPage
      quiz={{
        id: quizData.quiz.id,
        title: quizData.quiz.title,
        chapterId: quizData.quiz.chapterId,
        chapterTitle: quizData.quiz.chapterTitle,
        questions: quizData.quiz.questions,
      }}
      token={token}
      latestResult={quizData.latestResult}
      backUrl="/tests/improve"
      nextTopicUrl={quizData.nextTopicUrl}
      pageType="topic"
    />
  )
}

export default ImproveScreen
