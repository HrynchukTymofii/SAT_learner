import { db } from "@/lib/db"
import { auth } from "@/lib/getAuth"
import { redirect } from "next/navigation"
import { EnhancedTest } from "../../_components/enhanced-test"

interface QuizPageProps {
  params: Promise<{ quizId: string }>
  searchParams: Promise<{ mode?: string }>
}

const QuizPracticePage = async ({ params, searchParams }: QuizPageProps) => {
  const { quizId } = await params
  const { mode } = await searchParams
  const { userId } = await auth()

  // Get quiz with questions
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { position: "asc" },
      },
      chapter: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  })

  if (!quiz) {
    return redirect("/tests")
  }

  // Check access - if quiz is not free, user must be PRO
  if (!quiz.isFree) {
    if (!userId) {
      return redirect("/login")
    }

    const user = await db.user.findUnique({
      where: { userId },
      select: { isPro: true },
    })

    if (!user?.isPro) {
      return redirect("/pricing")
    }
  }

  // Format questions
  const questions = quiz.questions.map((q) => ({
    id: q.id,
    position: q.position,
    question: q.question,
    questionType: q.questionType,
    questionImageUrl: q.questionImageUrl,
    imageHeight: q.imageHeight,
    options: Array.isArray(q.options) ? (q.options as string[]) : [],
    answers: Array.isArray(q.answers) ? (q.answers as string[]) : [],
    points: q.points,
    hint: q.hint,
    hintImageUrl: q.hintImageUrl,
    note: q.note,
  }))

  // Get existing result if user is logged in
  let existingResult = null
  if (userId) {
    existingResult = await db.quizResult.findUnique({
      where: {
        userId_quizId: {
          userId,
          quizId: quiz.id,
        },
      },
    })
  }

  return (
    <EnhancedTest
      quiz={{
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions,
      }}
      userId={userId}
      mode="practice"
      existingResult={existingResult}
    />
  )
}

export default QuizPracticePage
