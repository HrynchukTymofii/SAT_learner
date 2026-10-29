import { db } from "@/lib/db"
import { auth } from "@/lib/getAuth"
import { redirect } from "next/navigation"
import { EnhancedTest } from "../_components/enhanced-test"

const ExamPage = async () => {
  const { userId } = await auth()

  // Get a full test quiz (you can configure which quiz ID to use)
  // For now, we'll get the first published quiz with enough questions
  const quiz = await db.quiz.findFirst({
    where: {
      isPublished: true,
      isFree: true,
      chapter: {
        course: {
          id: process.env.COURSE_ID,
        },
      },
    },
    include: {
      questions: {
        orderBy: { position: "asc" },
      },
    },
    orderBy: { position: "asc" },
  })

  if (!quiz) {
    return redirect("/tests")
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
      mode="exam"
      existingResult={existingResult}
    />
  )
}

export default ExamPage
