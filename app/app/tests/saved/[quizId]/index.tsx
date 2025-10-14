import { useEffect, useState } from "react"
import { View, Text } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { fetchSavedQuestions } from "@/lib/api/quiz"
import { useAuth } from "@/context/AuthContext"
import TestsPage from "@/components/TestsPage"

import { useQuizDatabase } from "@/lib/db/quiz"
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader"

const SavedQuizScreen = () => {
  const { quizId } = useLocalSearchParams<{ quizId: string }>()
  const router = useRouter()
  const { token } = useAuth()
  const { fetchSavedQuestionsLocal } = useQuizDatabase();

  const [quizData, setQuizData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quizId || !token) return

    const loadSaved = async () => {
      try {
        const data = await fetchSavedQuestionsLocal(quizId)
        //const data = await fetchSavedQuestions(token, quizId)

        if (!data) {
          router.replace("/tests/saved" as any)
          return
        }

        setQuizData(data)
      } catch (err) {
        setError("Failed to load saved questions")
      } finally {
        setLoading(false)
      }
    }

    loadSaved()
  }, [quizId, token])

  if (!token || !quizId) return null

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
      backUrl="/tests/saved"
      nextTopicUrl={quizData.nextTopicUrl}
      pageType="saved"
    />
  )
}

export default SavedQuizScreen
