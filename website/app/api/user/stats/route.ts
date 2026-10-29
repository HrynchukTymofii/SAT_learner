import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.userId

    // Get user data
    const user = await db.user.findUnique({
      where: { userId },
      select: { points: true, league: true, isPro: true },
    })

    // Count total lessons and completed lessons
    const totalLessons = await db.lesson.count({
      where: { isPublished: true },
    })

    const completedLessons = await db.lessonProgress.count({
      where: { userId, completed: true },
    })

    // Count total quizzes and completed quizzes
    const totalQuizzes = await db.quiz.count({
      where: { isPublished: true },
    })

    const completedQuizzes = await db.quizResult.count({
      where: { userId, completed: true },
    })

    // Get quiz stats (average score, etc)
    const quizResults = await db.quizResult.findMany({
      where: { userId },
      include: {
        quiz: {
          select: { title: true, maxScore: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    // Calculate average score percentage
    const quizScores = quizResults
      .filter((r) => r.quiz.maxScore > 0)
      .map((r) => (r.score / r.quiz.maxScore) * 100)

    const averageScore =
      quizScores.length > 0
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : 0

    // Estimate SAT score based on average performance (rough estimation)
    // SAT scores range from 400-1600
    const estimatedSatScore = Math.round(400 + (averageScore / 100) * 1200)

    // Get last quiz result
    const lastQuiz = quizResults[0]

    // Get chapter progress
    const chapters = await db.chapter.findMany({
      where: { isPublished: true },
      include: {
        lessons: {
          where: { isPublished: true },
          include: {
            progress: {
              where: { userId },
            },
          },
        },
        quizzes: {
          where: { isPublished: true },
          include: {
            results: {
              where: { userId },
            },
          },
        },
      },
      orderBy: { position: "asc" },
    })

    const chapterProgress = chapters.map((chapter, index) => {
      const totalItems = chapter.lessons.length + chapter.quizzes.length
      const completedItems =
        chapter.lessons.filter((l) => l.progress.some((p) => p.completed)).length +
        chapter.quizzes.filter((q) => q.results.some((r) => r.completed)).length

      return {
        id: chapter.id,
        title: chapter.title,
        progress: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
        colorIndex: index % 5,
      }
    })

    // Get recent activity (last 5 quizzes/lessons)
    const recentQuizzes = await db.quizResult.findMany({
      where: { userId },
      include: {
        quiz: { select: { title: true, maxScore: true, chapterId: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    })

    const recentActivity = recentQuizzes.map((r) => ({
      id: r.id,
      type: "quiz" as const,
      title: r.quiz.title,
      score: r.score,
      maxScore: r.quiz.maxScore,
      date: r.updatedAt.toISOString(),
      completed: r.completed,
    }))

    // Get weak areas (chapters with lowest average scores)
    const chapterScores = chapters
      .map((chapter) => {
        const quizResults = chapter.quizzes.flatMap((q) => q.results)
        if (quizResults.length === 0) return null

        const avgScore =
          quizResults.reduce((sum, r) => {
            const quiz = chapter.quizzes.find((q) => q.id === r.quizId)
            if (!quiz || quiz.maxScore === 0) return sum
            return sum + (r.score / quiz.maxScore) * 100
          }, 0) / quizResults.length

        return {
          id: chapter.id,
          title: chapter.title,
          averageScore: Math.round(avgScore),
        }
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 3)

    // Get saved questions count
    const savedQuestionsCount = await db.userQuizQuestion.count({
      where: { userId, saved: true },
    })


    // Calculate study streak (simplified - count consecutive days with activity)
    const recentDays = await db.quizResult.findMany({
      where: { userId },
      select: { updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 30,
    })

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)

      const hasActivity = recentDays.some((r) => {
        const actDate = new Date(r.updatedAt)
        actDate.setHours(0, 0, 0, 0)
        return actDate.getTime() === checkDate.getTime()
      })

      if (hasActivity) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    // Calculate overall course progress
    const totalContent = totalLessons + totalQuizzes
    const completedContent = completedLessons + completedQuizzes
    const courseProgress =
      totalContent > 0 ? Math.round((completedContent / totalContent) * 100) : 0

    const lessonProgress =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    const quizProgress =
      totalQuizzes > 0 ? Math.round((completedQuizzes / totalQuizzes) * 100) : 0

    return NextResponse.json({
      user: {
        points: user?.points || 0,
        league: user?.league || "Beginner",
        isPro: user?.isPro || false,
      },
      progress: {
        courseProgress,
        lessonProgress,
        quizProgress,
        lessonsCompleted: completedLessons,
        totalLessons,
        quizzesCompleted: completedQuizzes,
        totalQuizzes,
      },
      scores: {
        averageScore,
        estimatedSatScore,
        lastQuiz: lastQuiz
          ? {
              title: lastQuiz.quiz.title,
              score: lastQuiz.score,
              maxScore: lastQuiz.quiz.maxScore,
              date: lastQuiz.updatedAt.toISOString(),
            }
          : null,
      },
      chapterProgress,
      recentActivity,
      weakAreas: chapterScores,
      streak,
      savedQuestionsCount,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
