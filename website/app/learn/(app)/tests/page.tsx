import { db } from "@/lib/db"
import { auth } from "@/lib/getAuth"
import { TestsLanding } from "./_components/tests-landing"

const TestsPage = async () => {
  const { userId } = await auth()

  // Get user data to check PRO status
  let user = null
  let savedQuestionsCount = 0
  let wrongAnswersCount = 0

  if (userId) {
    user = await db.user.findUnique({
      where: { userId },
      select: { isPro: true, points: true, league: true },
    })

    // Count saved questions
    savedQuestionsCount = await db.userQuizQuestion.count({
      where: { userId, saved: true },
    })

    // Count wrong answers from quiz results
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

    // Calculate wrong answers
    quizResults.forEach((result) => {
      const answers = result.answers as Record<string, string[]>
      result.quiz.questions.forEach((question) => {
        const userAnswer = answers[question.id] || []
        const correctAnswers = question.answers as string[]
        const isCorrect =
          correctAnswers.length === userAnswer.length &&
          correctAnswers.every((a) => userAnswer.includes(a))
        if (!isCorrect && userAnswer.length > 0) {
          wrongAnswersCount++
        }
      })
    })
  }

  // Get available full test quizzes
  const fullTestQuizzes = await db.quiz.findMany({
    where: {
      isPublished: true,
      chapter: {
        course: {
          id: process.env.COURSE_ID,
        },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      totalQuestions: true,
      isFree: true,
      chapter: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { position: "asc" },
  })

  // Get chapters for topic-based practice
  const chapters = await db.chapter.findMany({
    where: {
      isPublished: true,
      course: {
        id: process.env.COURSE_ID,
      },
    },
    include: {
      quizzes: {
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          totalQuestions: true,
          isFree: true,
        },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { position: "asc" },
  })

  return (
    <TestsLanding
      userId={userId}
      isPro={user?.isPro || false}
      chapters={chapters}
      fullTestQuizzes={fullTestQuizzes}
      savedQuestionsCount={savedQuestionsCount}
      wrongAnswersCount={wrongAnswersCount}
    />
  )
}

export default TestsPage
