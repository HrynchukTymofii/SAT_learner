"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Star,
  AlertCircle,
  Bookmark,
  Trophy,
  Zap,
  Loader2,
  FileQuestion,
  ArrowRight,
  Lock,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/useAuth"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface StatsData {
  user: {
    points: number
    league: string
    isPro: boolean
  }
  progress: {
    courseProgress: number
    lessonProgress: number
    quizProgress: number
    lessonsCompleted: number
    totalLessons: number
    quizzesCompleted: number
    totalQuizzes: number
  }
  scores: {
    averageScore: number
    estimatedSatScore: number
    lastQuiz: {
      title: string
      score: number
      maxScore: number
      date: string
    } | null
  }
  chapterProgress: {
    id: string
    title: string
    progress: number
    colorIndex: number
  }[]
  recentActivity: {
    id: string
    type: "quiz" | "lesson"
    title: string
    score: number
    maxScore: number
    date: string
    completed: boolean
  }[]
  weakAreas: {
    id: string
    title: string
    averageScore: number
  }[]
  streak: number
  savedQuestionsCount: number
}

const chapterColors = [
  "bg-on-pastel",
  "bg-on-pastel",
  "bg-on-pastel",
  "bg-on-pastel",
  "bg-on-pastel",
]

const chapterBgColors = [
  "bg-mint",
  "bg-rose",
  "bg-lav",
  "bg-butter",
  "bg-lav-2",
]

// Animated Circular Progress Component
const CircularProgress = ({
  value,
  size = 120,
  strokeWidth = 10,
  color = "primary",
  label,
  sublabel,
}: {
  value: number
  size?: number
  strokeWidth?: number
  color?: "primary" | "green" | "amber"
  label: string
  sublabel: string
}) => {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 300)
    return () => clearTimeout(timer)
  }, [value])

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference

  const colorClasses = {
    primary: "text-primary",
    green: "text-success",
    amber: "text-warn",
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="fill-none stroke-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={cn("fill-none transition-all duration-[2000ms] ease-out stroke-current", colorClasses[color])}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold">{Math.round(animatedValue)}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold">{label}</p>
        <p className="text-sm text-muted-foreground">{sublabel}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, isPro } = useAuth()
  // The platform layout already requires a login; wait for the session before checking PRO
  const { status } = useSession()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== "authenticated") return
    // Stats are a PRO feature: show a message instead of silently sending the user home
    if (!isPro) {
      setLoading(false)
      return
    }
    fetchStats()
  }, [status, isPro])

  async function fetchStats() {
    try {
      const res = await fetch("/api/user/stats")
      if (!res.ok) throw new Error("Failed to fetch stats")
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error("Error fetching stats:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (status === "authenticated" && !isPro) {
    return (
      <div className="w-full max-w-md flex items-center justify-center py-16">
        <Card className="p-6 space-y-3 text-center">
          <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-semibold">Stats are part of PRO</h1>
          <p className="text-sm text-muted-foreground">
            See your scores, accuracy by topic and progress over time. Get PRO in the SAT Learner app;
            it unlocks Stats here too.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-destructive">{error || "Something went wrong"}</p>
          <Button onClick={fetchStats} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      {/* Background decorations */}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                SAT Prep Dashboard
              </h1>
              <p className="text-xl text-muted-foreground">
                Welcome back, {user?.name?.split(" ")[0] || "Student"}!
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="font-semibold">{stats.user.points} pts</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-butter">
                <Zap className="h-5 w-5 text-warn" />
                <span className="font-semibold">{stats.streak} day streak</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-xl pb-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-xl">
                    <Target className="h-6 w-6 text-primary-foreground" />
                  </div>
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Progress Circles */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <CircularProgress
                      value={stats.progress.courseProgress}
                      color="primary"
                      label="Course Progress"
                      sublabel="Overall completion"
                    />
                    <CircularProgress
                      value={stats.progress.lessonProgress}
                      color="green"
                      label="Lessons"
                      sublabel={`${stats.progress.lessonsCompleted}/${stats.progress.totalLessons}`}
                    />
                    <CircularProgress
                      value={stats.progress.quizProgress}
                      color="amber"
                      label="Quizzes"
                      sublabel={`${stats.progress.quizzesCompleted}/${stats.progress.totalQuizzes}`}
                    />
                  </div>

                  {/* Performance Summary */}
                  <div className="border-t pt-8">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      Performance Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {stats.scores.lastQuiz && (
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold">Last Test</span>
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <p className="font-bold mb-1 truncate">{stats.scores.lastQuiz.title}</p>
                            <Badge className="bg-primary text-primary-foreground">
                              {stats.scores.lastQuiz.score}/{stats.scores.lastQuiz.maxScore}
                            </Badge>
                          </CardContent>
                        </Card>
                      )}

                      <Card className="bg-mint border-success/40 pb-6">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold">Est. SAT Score</span>
                            <Trophy className="h-5 w-5 text-success" />
                          </div>
                          <p className="text-3xl font-bold text-success">
                            {stats.scores.estimatedSatScore}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Based on practice</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-lav-2 border-lav-2 pb-6">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold">Avg. Score</span>
                            <BookOpen className="h-5 w-5 text-brand" />
                          </div>
                          <p className="text-3xl font-bold">{stats.scores.averageScore}%</p>
                          <Progress value={stats.scores.averageScore} className="h-2 mt-2" />
                        </CardContent>
                      </Card>

                      <Card className="bg-butter border-[#F2C94C] pb-6">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold">Saved Questions</span>
                            <Bookmark className="h-5 w-5 text-warn" />
                          </div>
                          <p className="text-3xl font-bold">{stats.savedQuestionsCount}</p>
                          <Link href="/tests/saved" className="text-xs text-primary hover:underline mt-1 inline-block">
                            Review saved
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Chapter Progress & Weak Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chapter Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="shadow-xl h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-xl">
                      <BookOpen className="h-5 w-5 text-primary-foreground" />
                    </div>
                    Chapter Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.chapterProgress.slice(0, 5).map((chapter) => (
                      <div
                        key={chapter.id}
                        className={cn("p-4 rounded-xl", chapterBgColors[chapter.colorIndex])}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium truncate">{chapter.title}</span>
                          <span className="text-sm font-bold">{chapter.progress}%</span>
                        </div>
                        <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-500", chapterColors[chapter.colorIndex])}
                            style={{ width: `${chapter.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {stats.chapterProgress.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Start learning to see your progress!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Weak Areas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="shadow-xl h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-3">
                    <div className="p-2 bg-destructive rounded-xl">
                      <AlertCircle className="h-5 w-5 text-destructive-foreground" />
                    </div>
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.weakAreas.map((area) => (
                      <div
                        key={area.id}
                        className="p-4 rounded-xl bg-destructive/5 border border-destructive/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{area.title}</span>
                          <Badge variant="destructive">{area.averageScore}%</Badge>
                        </div>
                        <Link
                          href={`/course/${area.id}`}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Practice more <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ))}
                    {stats.weakAreas.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Complete more quizzes to identify weak areas
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-xl">
                    <Star className="h-5 w-5 text-primary-foreground" />
                  </div>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          activity.type === "quiz" ? "bg-primary/10" : "bg-mint"
                        )}>
                          {activity.type === "quiz" ? (
                            <FileQuestion className="h-5 w-5 text-primary" />
                          ) : (
                            <BookOpen className="h-5 w-5 text-success" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={activity.completed ? "default" : "secondary"}>
                        {activity.score}/{activity.maxScore}
                      </Badge>
                    </div>
                  ))}
                  {stats.recentActivity.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No recent activity. Start learning!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Link href="/tests/wrong">
              <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-destructive/10 rounded-xl group-hover:bg-destructive/20 transition-colors">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="font-semibold">Review Wrong Answers</p>
                    <p className="text-sm text-muted-foreground">Practice your mistakes</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tests/saved">
              <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-butter rounded-xl group-hover:bg-butter transition-colors">
                    <Bookmark className="h-6 w-6 text-warn" />
                  </div>
                  <div>
                    <p className="font-semibold">Saved Questions</p>
                    <p className="text-sm text-muted-foreground">{stats.savedQuestionsCount} questions saved</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/planner">
              <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Study Planner</p>
                    <p className="text-sm text-muted-foreground">Plan your prep</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
