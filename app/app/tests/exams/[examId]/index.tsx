import { useEffect, useState } from "react"
import { View, Text } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { fetchQuizById } from "@/lib/api/quiz"
import { useAuth } from "@/context/AuthContext"
import QuizScreen from "@/components/quiz/QuizScreen"
import { EmptyState, Loading, Screen, TopBar } from "@/components/ds"
import { CircleAlert } from "lucide-react-native"
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
      <Loading />
    );
  }

  if (error || !quizData) {
    return (
      <Screen header={<TopBar />} contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <EmptyState icon={CircleAlert} tone="rose" title="Couldn't open this test" text={error || "Something went wrong. Please try again."} action="Go back" onAction={() => router.back()} />
      </Screen>
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
