import { db } from "@/lib/db"
import { auth } from "@/lib/getAuth"
import { redirect } from "next/navigation"
import { EnhancedTest } from "../_components/enhanced-test"

const WrongAnswersPage = async () => {
  const { userId } = await auth()

  if (!userId) {
    return redirect("/login")
  }

  // Check if user is PRO
  const user = await db.user.findUnique({
    where: { userId },
    select: { isPro: true },
  })

  if (!user?.isPro) {
    return redirect("/pricing")
  }

  // Get all quiz results for this user
  const quizResults = await db.quizResult.findMany({
    where: { userId },
    include: {
      quiz: {
        include: {
          questions: true,
        },
      },
    },
  })

  // Find all incorrectly answered questions
  const wrongQuestions: any[] = []

  quizResults.forEach((result) => {
    const answers = result.answers as Record<string, string[]>

    result.quiz.questions.forEach((question) => {
      const userAnswer = answers[question.id] || []
      const correctAnswers = question.answers as string[]

      // Check if answer was wrong
      const isCorrect =
        correctAnswers.length === userAnswer.length &&
        correctAnswers.every((a) => userAnswer.includes(a))

      // Only include if user attempted the question and got it wrong
      if (!isCorrect && userAnswer.length > 0) {
        // Avoid duplicates
        if (!wrongQuestions.find((q) => q.id === question.id)) {
          wrongQuestions.push(question)
        }
      }
    })
  })

  if (wrongQuestions.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-mint flex items-center justify-center">
            <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3">No Wrong Answers</h1>
          <p className="text-muted-foreground mb-6">
            Great job! You don&apos;t have any incorrectly answered questions to review. Keep practicing to maintain your skills!
          </p>
          <a
            href="/tests"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Continue Practicing
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    )
  }

  // Format questions
  const questions = wrongQuestions.map((q, index) => ({
    id: q.id,
    position: index,
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

  return (
    <EnhancedTest
      quiz={{
        id: "wrong",
        title: "Wrong Answers Review",
        description: `Practice your ${questions.length} incorrectly answered questions`,
        questions,
      }}
      userId={userId}
      mode="wrong"
    />
  )
}

export default WrongAnswersPage
