import { useEffect, useState } from "react"
import { View, Text } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { fetchSavedQuestions } from "@/lib/api/quiz"
import { useAuth } from "@/context/AuthContext"
import QuizScreen from "@/components/quiz/QuizScreen"
import { EmptyState, Loading, Screen, TopBar } from "@/components/ds"
import { CircleAlert } from "lucide-react-native"

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
      <Loading />
    );
  }

  if (error || !quizData) {
    return (
      <Screen header={<TopBar />} contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <EmptyState icon={CircleAlert} tone="rose" title="Couldn't open these questions" text={error || "Something went wrong. Please try again."} action="Go back" onAction={() => router.back()} />
      </Screen>
    )
  }

  return (
    <QuizScreen
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
