"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  BookOpen,
  Target,
  Trophy,
  Bookmark,
  XCircle,
  TrendingUp,
  ChevronRight,
  Lock,
  Zap,
  GraduationCap,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Chapter {
  id: string
  title: string
  quizzes: {
    id: string
    title: string
    totalQuestions: number
    isFree: boolean
  }[]
}

interface TestsLandingProps {
  userId: string | null
  isPro: boolean
  chapters: Chapter[]
  fullTestQuizzes: any[]
  savedQuestionsCount: number
  wrongAnswersCount: number
}

export const TestsLanding = ({
  userId,
  isPro,
  chapters,
  fullTestQuizzes,
  savedQuestionsCount,
  wrongAnswersCount,
}: TestsLandingProps) => {
  const router = useRouter()
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)

  const testModes = [
    {
      id: "full-test",
      title: "Full SAT Practice Test",
      description: "70-minute timed exam with SAT scoring",
      icon: Trophy,
      color: "from-purple-500 to-indigo-600",
      badge: "FREE",
      badgeColor: "bg-green-100 text-green-800",
      available: true,
    },
    {
      id: "practice",
      title: "Practice by Topics",
      description: "Focus on specific math topics",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-600",
      badge: null,
      badgeColor: null,
      available: true,
    },
    {
      id: "saved",
      title: "Saved Questions",
      description: `Review your ${savedQuestionsCount} saved questions`,
      icon: Bookmark,
      color: "from-amber-500 to-orange-600",
      badge: isPro ? null : "PRO",
      badgeColor: "bg-purple-100 text-purple-800",
      available: isPro && savedQuestionsCount > 0,
      count: savedQuestionsCount,
    },
    {
      id: "wrong",
      title: "Wrong Answers Review",
      description: `Practice your ${wrongAnswersCount} incorrect answers`,
      icon: XCircle,
      color: "from-red-500 to-rose-600",
      badge: isPro ? null : "PRO",
      badgeColor: "bg-purple-100 text-purple-800",
      available: isPro && wrongAnswersCount > 0,
      count: wrongAnswersCount,
    },
    {
      id: "improvement",
      title: "Improvement Mode",
      description: "AI-powered focus on weak areas",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      badge: isPro ? null : "PRO",
      badgeColor: "bg-purple-100 text-purple-800",
      available: isPro,
    },
  ]

  const handleModeSelect = (modeId: string) => {
    if (modeId === "full-test") {
      router.push("/tests/exam")
    } else if (modeId === "practice") {
      setSelectedChapter("practice")
    } else if (modeId === "saved") {
      if (!isPro) {
        router.push("/pricing")
        return
      }
      router.push("/tests/saved")
    } else if (modeId === "wrong") {
      if (!isPro) {
        router.push("/pricing")
        return
      }
      router.push("/tests/wrong")
    } else if (modeId === "improvement") {
      if (!isPro) {
        router.push("/pricing")
        return
      }
      router.push("/tests/improvement")
    }
  }

  const handleQuizSelect = (quizId: string, chapterId: string, isFree: boolean) => {
    if (!isFree && !isPro) {
      router.push("/pricing")
      return
    }
    router.push(`/tests/quiz/${quizId}?mode=practice`)
  }

  // Practice by Topics view
  if (selectedChapter === "practice") {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => setSelectedChapter(null)}>
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Practice by Topics</h1>
              <p className="text-muted-foreground">Select a chapter to practice</p>
            </div>
          </div>

          {/* Chapters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((chapter, index) => (
              <Card
                key={chapter.id}
                className="hover:shadow-lg transition-all cursor-pointer border-0 bg-card"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <CardTitle className="text-lg">{chapter.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {chapter.quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      onClick={() => handleQuizSelect(quiz.id, chapter.id, quiz.isFree)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all",
                        "hover:bg-muted cursor-pointer",
                        !quiz.isFree && !isPro && "opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{quiz.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {quiz.totalQuestions} Q
                        </Badge>
                        {!quiz.isFree && !isPro && (
                          <Lock className="h-4 w-4 text-slate-400" />
                        )}
                        {quiz.isFree && (
                          <Badge className="bg-green-100 text-green-800 text-xs">FREE</Badge>
                        )}
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                  {chapter.quizzes.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No quizzes available
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // Main landing page
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mb-4">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">SAT Practice Tests</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Master the SAT with our comprehensive practice tests. Choose a mode to start practicing.
        </p>
      </motion.div>

      {/* Test Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testModes.map((mode, index) => {
          const Icon = mode.icon
          const isLocked = mode.badge === "PRO" && !isPro
          const isDisabled = !mode.available && !isLocked

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "relative overflow-hidden cursor-pointer transition-all hover:shadow-xl border-0",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !isDisabled && handleModeSelect(mode.id)}
              >
                {/* Gradient Background */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-10 bg-gradient-to-br",
                    mode.color
                  )}
                />

                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                        mode.color
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex gap-2">
                      {mode.badge && (
                        <Badge className={mode.badgeColor}>{mode.badge}</Badge>
                      )}
                      {isLocked && <Lock className="h-5 w-5 text-slate-400" />}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2">{mode.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{mode.description}</p>

                  {mode.count !== undefined && mode.count > 0 && (
                    <Badge variant="outline" className="mb-4">
                      {mode.count} questions
                    </Badge>
                  )}

                  <Button
                    className={cn(
                      "w-full bg-gradient-to-r",
                      mode.color,
                      "text-white border-0"
                    )}
                    disabled={isDisabled}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Unlock PRO
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Stats */}
      {userId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 bg-muted/50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Your Progress</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-card rounded-lg shadow-sm">
                  <Bookmark className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                  <div className="text-2xl font-bold text-foreground">{savedQuestionsCount}</div>
                  <div className="text-xs text-muted-foreground">Saved</div>
                </div>
                <div className="text-center p-4 bg-card rounded-lg shadow-sm">
                  <XCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold text-foreground">{wrongAnswersCount}</div>
                  <div className="text-xs text-muted-foreground">To Review</div>
                </div>
                <div className="text-center p-4 bg-card rounded-lg shadow-sm">
                  <Trophy className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                  <div className="text-2xl font-bold text-foreground">
                    {fullTestQuizzes.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Tests Available</div>
                </div>
                <div className="text-center p-4 bg-card rounded-lg shadow-sm">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold text-foreground">
                    {isPro ? "PRO" : "FREE"}
                  </div>
                  <div className="text-xs text-muted-foreground">Status</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Login Prompt for Guests */}
      {!userId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 bg-primary/5">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Sign in to track your progress
              </h3>
              <p className="text-muted-foreground mb-4">
                Create a free account to save your results and access more features.
              </p>
              <Button onClick={() => router.push("/login")}>Sign In</Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
