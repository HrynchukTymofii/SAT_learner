import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { StudyPlannerClient } from "./_components/study-planner-client"

export default async function PlannerPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.userId) {
    redirect("/login?callbackUrl=/planner")
  }

  // Get user settings (SAT date)
  const settings = await db.userSettings.findUnique({
    where: { userId: session.user.userId },
  })

  // Get today's plan
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayPlan = await db.studyPlan.findUnique({
    where: {
      userId_date: {
        userId: session.user.userId,
        date: today,
      },
    },
    include: {
      tasks: {
        orderBy: { position: "asc" },
      },
    },
  })

  // Get week plans (for calendar view)
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const weekPlans = await db.studyPlan.findMany({
    where: {
      userId: session.user.userId,
      date: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
    },
    include: {
      tasks: true,
    },
  })

  // Get suggested tasks (next incomplete lessons/quizzes)
  const suggestedTasks = await getSuggestedTasks(session.user.userId)

  return (
    <StudyPlannerClient
      initialPlan={todayPlan}
      initialWeekPlans={weekPlans}
      satDate={settings?.satDate?.toISOString() || null}
      suggestedTasks={suggestedTasks}
    />
  )
}

async function getSuggestedTasks(userId: string) {
  const suggestions: { title: string; type: string; targetId: string }[] = []

  // Get next incomplete lesson
  const nextLesson = await db.lesson.findFirst({
    where: {
      isPublished: true,
      NOT: {
        progress: {
          some: {
            userId,
            completed: true,
          },
        },
      },
    },
    include: {
      chapter: true,
    },
    orderBy: [
      { chapter: { position: "asc" } },
      { position: "asc" },
    ],
  })

  if (nextLesson) {
    suggestions.push({
      title: `Complete lesson: ${nextLesson.title}`,
      type: "lesson",
      targetId: nextLesson.id,
    })
  }

  // Get next incomplete quiz
  const nextQuiz = await db.quiz.findFirst({
    where: {
      isPublished: true,
      NOT: {
        results: {
          some: {
            userId,
            completed: true,
          },
        },
      },
    },
    include: {
      chapter: true,
    },
    orderBy: [
      { chapter: { position: "asc" } },
      { position: "asc" },
    ],
  })

  if (nextQuiz) {
    suggestions.push({
      title: `Take quiz: ${nextQuiz.title}`,
      type: "quiz",
      targetId: nextQuiz.id,
    })
  }

  // Add a review suggestion
  const hasWrongAnswers = await db.quizResult.findFirst({
    where: {
      userId,
      score: { lt: 100 },
    },
  })

  if (hasWrongAnswers) {
    suggestions.push({
      title: "Review wrong answers",
      type: "review",
      targetId: "wrong",
    })
  }

  return suggestions
}
