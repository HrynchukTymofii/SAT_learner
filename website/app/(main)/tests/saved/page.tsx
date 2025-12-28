import { db } from "@/lib/db"
import { auth } from "@/lib/getAuth"
import { redirect } from "next/navigation"
import { EnhancedTest } from "../_components/enhanced-test"

const SavedQuestionsPage = async () => {
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

  // Get all saved questions for this user
  const savedQuestions = await db.userQuizQuestion.findMany({
    where: {
      userId,
      saved: true,
    },
    include: {
      question: true,
    },
  })

  if (savedQuestions.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-3">No Saved Questions</h1>
          <p className="text-muted-foreground mb-6">
            You haven&apos;t saved any questions yet. While practicing, click the bookmark icon to save questions for later review.
          </p>
          <a
            href="/tests"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            Start Practicing
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    )
  }

  // Format questions
  const questions = savedQuestions.map((sq, index) => ({
    id: sq.question.id,
    position: index,
    question: sq.question.question,
    questionType: sq.question.questionType,
    questionImageUrl: sq.question.questionImageUrl,
    imageHeight: sq.question.imageHeight,
    options: Array.isArray(sq.question.options) ? (sq.question.options as string[]) : [],
    answers: Array.isArray(sq.question.answers) ? (sq.question.answers as string[]) : [],
    points: sq.question.points,
    hint: sq.question.hint,
    hintImageUrl: sq.question.hintImageUrl,
    note: sq.question.note,
  }))

  return (
    <EnhancedTest
      quiz={{
        id: "saved",
        title: "Saved Questions",
        description: `Review your ${questions.length} saved questions`,
        questions,
      }}
      userId={userId}
      mode="saved"
    />
  )
}

export default SavedQuestionsPage
