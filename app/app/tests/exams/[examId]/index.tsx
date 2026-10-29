import { useEffect, useState } from "react"
import { View, Text } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { fetchQuizById } from "@/lib/api/quiz"
import { useAuth } from "@/context/AuthContext"
import QuizScreen from "@/components/quiz/QuizScreen"
import { useQuizDatabase } from "@/lib/db/quiz"
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader"

const ExamsScreen = () => {
  const { examId } = useLocalSearchParams<{ examId: string }>()
  const router = useRouter()
  const { token } = useAuth()
  const { fetchQuizByIdLocal } = useQuizDatabase();

  const [quizData, setQuizData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!examId || !token) return

    const loadQuiz = async () => {
      try {
        const data = await fetchQuizByIdLocal(examId);

        //const data = await fetchQuizById(examId, token)

        if (!data) {
          router.replace("/tests/exams" as any)
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
  }, [examId, token])


  if (loading || !token || !examId) {
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
    <QuizScreen
      quiz={{
        id: quizData.quiz.id,
        title: quizData.quiz.title,
        chapterId: quizData.quiz.chapterId,
        chapterTitle: quizData.quiz.chapterTitle,
        questions: quizData.quiz.questions,
      }}
      token={token}
      latestResult={quizData.latestResult}
      backUrl="/tests/exams"
      nextTopicUrl={quizData.nextTopicUrl}
      pageType="exam"
    />
  )
}

export default ExamsScreen
