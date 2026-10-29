"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Grid3X3,
  RotateCcw,
  BookOpen,
  Trophy,
  ArrowRight,
  Play,
  Bookmark,
} from "lucide-react"
import { cn, calculateSATScore } from "@/lib/utils"
import { ReadOnlyEditor } from "@/components/tiptap-templates/simple/readonly-editor"
import Image from "next/image"
import { HintModal } from "./hint-modal"
import { QuestionGrid } from "./question-grid"
import toast from "react-hot-toast"
import axios from "axios"
import { useRouter } from "next/navigation"

export type TestMode = "exam" | "practice" | "saved" | "wrong" | "improvement"

interface Question {
  id: string
  position: number
  question: string
  questionType: string | null
  questionImageUrl?: string | null
  imageHeight?: number
  options: string[]
  answers: string[]
  points: number
  hint: string | null
  hintImageUrl?: string | null
  note: string | null
}

interface EnhancedTestProps {
  quiz: {
    id: string
    title: string
    description?: string | null
    questions: Question[]
  }
  userId: string | null
  mode: TestMode
  existingResult?: any
  onBack?: () => void
}

export const EnhancedTest = ({
  quiz,
  userId,
  mode,
  existingResult,
  onBack,
}: EnhancedTestProps) => {
  const router = useRouter()
  const [hasStarted, setHasStarted] = useState(mode !== "exam")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({})
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)

  // Timer state
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState<number>(0)
  const timeLimit = mode === "exam" ? 70 * 60 : 0 // 70 minutes for exam mode

  // Modals
  const [isHintModalOpen, setIsHintModalOpen] = useState(false)
  const [isGridModalOpen, setIsGridModalOpen] = useState(false)

  // Saved questions
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<string>>(new Set())

  const questions = quiz.questions
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const timeRemaining = Math.max(0, timeLimit - timeSpent)

  // Timer effect
  useEffect(() => {
    if (!hasStarted || showResults) return

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setTimeSpent(elapsed)

      // Auto-submit for exam mode when time runs out
      if (mode === "exam" && elapsed >= timeLimit) {
        handleAutoSubmit()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [hasStarted, startTime, showResults, mode])

  // Load existing answers if available
  useEffect(() => {
    if (existingResult?.answers) {
      const answers = existingResult.answers as Record<string, string[]>
      setSelectedAnswers(answers)

      // Mark questions as answered
      const answered: Record<string, boolean> = {}
      Object.keys(answers).forEach((questionId) => {
        const question = questions.find((q) => q.id === questionId)
        if (question) {
          const isCorrect = checkIsCorrect(question.answers, answers[questionId])
          answered[questionId] = isCorrect
        }
      })
      setAnsweredQuestions(answered)
    }
  }, [existingResult])

  // Load saved questions for this user
  useEffect(() => {
    if (!userId) return
    loadSavedQuestions()
  }, [userId])

  const loadSavedQuestions = async () => {
    try {
      const res = await axios.get("/api/user/course/quiz/saved-ids")
      if (res.data?.savedIds) {
        setSavedQuestionIds(new Set(res.data.savedIds))
      }
    } catch (error) {
      console.error("Error loading saved questions:", error)
    }
  }

  const toggleSaveQuestion = async (questionId: string) => {
    if (!userId) {
      toast.error("Please log in to save questions")
      return
    }

    const isSaved = savedQuestionIds.has(questionId)

    // Optimistic update
    setSavedQuestionIds((prev) => {
      const newSet = new Set(prev)
      if (isSaved) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })

    try {
      await axios.post("/api/user/course/quiz/question/save", {
        questionId,
        saved: !isSaved,
      })
      toast.success(isSaved ? "Question unsaved" : "Question saved!", { duration: 1500 })
    } catch (error) {
      // Revert on error
      setSavedQuestionIds((prev) => {
        const newSet = new Set(prev)
        if (isSaved) {
          newSet.add(questionId)
        } else {
          newSet.delete(questionId)
        }
        return newSet
      })
      toast.error("Failed to save question")
    }
  }

  const startExam = () => {
    setHasStarted(true)
    setStartTime(Date.now())
    toast.success("Test started! Good luck!")
  }

  const checkIsCorrect = (correctAnswers: string[], userAnswers: string[]): boolean => {
    return (
      correctAnswers.length === userAnswers.length &&
      correctAnswers.every((a) => userAnswers.includes(a))
    )
  }

  const handleAnswerSelect = (option: string) => {
    if (answeredQuestions[currentQuestion.id] !== undefined && mode !== "exam") return

    const questionId = currentQuestion.id
    const newAnswers = {
      ...selectedAnswers,
      [questionId]: [option],
    }
    setSelectedAnswers(newAnswers)

    // For exam mode, don't auto-check answers
    if (mode === "exam") return

    // Check answer and show feedback for practice modes
    const isCorrect = checkIsCorrect(currentQuestion.answers, [option])
    setAnsweredQuestions((prev) => ({
      ...prev,
      [questionId]: isCorrect,
    }))

    if (isCorrect) {
      toast.success("Correct!", { duration: 1000 })
    } else {
      toast.error("Incorrect", { duration: 1000 })
    }
  }

  const handleExamConfirmAnswer = () => {
    const questionId = currentQuestion.id
    const userAnswer = selectedAnswers[questionId]?.[0]

    if (!userAnswer) return

    const isCorrect = checkIsCorrect(currentQuestion.answers, [userAnswer])
    setAnsweredQuestions((prev) => ({
      ...prev,
      [questionId]: isCorrect,
    }))

    if (isCorrect) {
      toast.success("Correct!", { duration: 1000 })
    } else {
      toast.error("Incorrect", { duration: 1000 })
    }
  }

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleAutoSubmit = () => {
    toast.error("Time's up! Test submitted automatically.")
    submitResults()
  }

  const submitResults = async () => {
    setIsSubmitting(true)

    try {
      // Calculate results
      let correctCount = 0
      questions.forEach((q) => {
        const userAns = selectedAnswers[q.id] || []
        if (checkIsCorrect(q.answers, userAns)) {
          correctCount++
        }
      })

      const percentage = Math.round((correctCount / questions.length) * 100)
      const satScore = mode === "exam" ? calculateSATScore(correctCount, questions.length) : null
      const passed = mode === "exam" ? percentage >= 75 : percentage >= 90

      const resultData = {
        correctCount,
        totalQuestions: questions.length,
        percentage,
        passed,
        satScore,
        timeSpent,
      }

      setResults(resultData)
      setShowResults(true)

      // Save to server if logged in
      if (userId) {
        await axios.post("/api/user/course/quiz", {
          userId,
          quizId: quiz.id,
          answers: selectedAnswers,
          timeSpent,
        })
      }

      toast.success("Test completed!")
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast.error("Error saving results")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = async () => {
    if (userId) {
      try {
        await axios.delete(`/api/user/course/quiz`, {
          data: { userId, quizId: quiz.id },
        })
      } catch (error) {
        console.error("Error resetting quiz:", error)
      }
    }

    setSelectedAnswers({})
    setAnsweredQuestions({})
    setCurrentQuestionIndex(0)
    setShowResults(false)
    setResults(null)
    setTimeSpent(0)
    setHasStarted(mode !== "exam")
    toast.success("Test reset!")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isAnswered = currentQuestion.id in answeredQuestions
  const hasSelectedAnswer = !!selectedAnswers[currentQuestion.id]?.length

  // Pre-test screen for exam mode
  if (!hasStarted && mode === "exam") {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-xl border-0 bg-card overflow-hidden">
            <div className="bg-lav-2 text-on-pastel p-6 md:p-8">
              <div className="text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{quiz.title}</h1>
                <p className="text-muted-foreground">Full SAT Practice Exam</p>
              </div>
            </div>

            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-secondary rounded-lg">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-brand" />
                  <div className="font-semibold text-foreground">{questions.length}</div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-warn" />
                  <div className="font-semibold text-foreground">70 min</div>
                  <div className="text-sm text-muted-foreground">Time Limit</div>
                </div>
                <div className="p-4 bg-secondary rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-success" />
                  <div className="font-semibold text-foreground">200-800</div>
                  <div className="text-sm text-muted-foreground">SAT Score</div>
                </div>
              </div>

              <div className="bg-butter border border-[#F2C94C] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warn mt-0.5" />
                  <div>
                    <h3 className="font-medium text-warn mb-2">Exam Instructions</h3>
                    <ul className="text-warn text-sm space-y-1">
                      <li>You have 70 minutes to complete all questions</li>
                      <li>Select your answer and click "Confirm" to lock it in</li>
                      <li>You can navigate between questions freely</li>
                      <li>Your SAT score will be calculated at the end</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => router.push("/tests")}>
                  Cancel
                </Button>
                <Button onClick={startExam} size="lg" className="bg-mint hover:bg-mint">
                  <Play className="h-5 w-5 mr-2" />
                  Start Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Results screen
  if (showResults && results) {
    return (
      <TestResults
        results={results}
        quiz={quiz}
        questions={questions}
        selectedAnswers={selectedAnswers}
        mode={mode}
        onRetry={handleRetry}
        userId={userId}
      />
    )
  }

  // Main test interface
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Header */}
      <Card className="shadow-sm border-0 bg-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/tests")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-bold text-foreground">{quiz.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">
                    {currentQuestionIndex + 1} / {questions.length}
                  </Badge>
                  {mode === "exam" && (
                    <Badge variant="outline" className="uppercase text-xs">
                      Exam Mode
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              {mode === "exam" && (
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg",
                    timeRemaining < 300 ? "bg-rose text-destructive" : "bg-secondary text-foreground"
                  )}
                >
                  <Clock className="h-4 w-4" />
                  <span className="font-mono font-semibold">{formatTime(timeRemaining)}</span>
                </div>
              )}

              {/* Question Grid Button */}
              <Button variant="outline" size="sm" onClick={() => setIsGridModalOpen(true)}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-1.5 mt-4" />

          {/* Time Warning */}
          {mode === "exam" && timeRemaining < 300 && timeRemaining > 0 && (
            <div className="bg-rose border border-destructive/40 rounded-lg p-2 mt-3">
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Less than 5 minutes remaining!</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Question Side */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-lg border-0 bg-card h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {currentQuestionIndex + 1}
                    </div>
                    <Badge variant="outline" className="bg-butter text-warn border-[#F2C94C]">
                      {currentQuestion.points} pts
                    </Badge>
                  </div>
                  {/* Save & Hint Buttons */}
                  <div className="flex items-center gap-1">
                    {userId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSaveQuestion(currentQuestion.id)}
                        className={cn(
                          "transition-colors",
                          savedQuestionIds.has(currentQuestion.id)
                            ? "text-warn hover:text-warn"
                            : "text-muted-foreground hover:text-warn"
                        )}
                        title={savedQuestionIds.has(currentQuestion.id) ? "Remove from saved" : "Save question"}
                      >
                        <Bookmark
                          className={cn(
                            "h-5 w-5",
                            savedQuestionIds.has(currentQuestion.id) && "fill-current"
                          )}
                        />
                      </Button>
                    )}
                    {currentQuestion.hint && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsHintModalOpen(true)}
                        className="text-warn hover:text-foreground hover:bg-butter"
                      >
                        <Lightbulb className="h-5 w-5 fill-[#F2C94C]" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <ReadOnlyEditor initialContent={currentQuestion.question} />
                </div>

                {currentQuestion.questionImageUrl && (
                  <div className="relative">
                    <Image
                      src={currentQuestion.questionImageUrl}
                      alt="Question illustration"
                      width={500}
                      height={currentQuestion.imageHeight || 300}
                      className="rounded-lg border max-w-full h-auto"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Options Side */}
        <Card className="shadow-lg border-0 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Choose your answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion.id]?.includes(option)
              const isCorrectOption = currentQuestion.answers.includes(option)
              const showFeedback = isAnswered

              let optionStyle = "bg-secondary border-border hover:bg-muted"
              if (isSelected && !showFeedback) {
                optionStyle = "bg-primary/10 border-primary"
              } else if (showFeedback && isCorrectOption) {
                optionStyle = "bg-mint border-success/40"
              } else if (showFeedback && isSelected && !isCorrectOption) {
                optionStyle = "bg-rose border-destructive/40"
              }

              return (
                <div
                  key={index}
                  onClick={() => !isAnswered && handleAnswerSelect(option)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer",
                    optionStyle,
                    isAnswered && "cursor-default"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1 text-foreground">{option}</span>
                  {showFeedback && isCorrectOption && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                  {showFeedback && isSelected && !isCorrectOption && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              )
            })}

            {/* Exam mode confirm button */}
            {mode === "exam" && hasSelectedAnswer && !isAnswered && (
              <Button onClick={handleExamConfirmAnswer} className="w-full mt-4 bg-lav hover:bg-lav">
                Confirm Answer
              </Button>
            )}
          </CardContent>

          {/* Explanation */}
          {isAnswered && currentQuestion.note && (
            <CardContent className="pt-0">
              <div className="bg-lav-2 border border-lav-2 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-brand mt-0.5" />
                  <div>
                    <h4 className="font-medium text-brand mb-2">Explanation</h4>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <ReadOnlyEditor initialContent={currentQuestion.note} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Navigation */}
      <Card className="shadow-sm border-0 bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-3">
              {currentQuestionIndex === questions.length - 1 ||
              Object.keys(answeredQuestions).length === questions.length ? (
                <Button
                  onClick={submitResults}
                  disabled={isSubmitting}
                  className="bg-mint hover:bg-mint"
                >
                  <Target className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Finish Test"}
                </Button>
              ) : (
                <Button onClick={nextQuestion} disabled={currentQuestionIndex === questions.length - 1}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <HintModal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        hint={currentQuestion.hint}
        hintImageUrl={currentQuestion.hintImageUrl}
      />

      <QuestionGrid
        isOpen={isGridModalOpen}
        onClose={() => setIsGridModalOpen(false)}
        questions={questions}
        answeredQuestions={answeredQuestions}
        currentQuestionIndex={currentQuestionIndex}
        onQuestionSelect={setCurrentQuestionIndex}
      />
    </div>
  )
}

// Results Component
const TestResults = ({
  results,
  quiz,
  questions,
  selectedAnswers,
  mode,
  onRetry,
  userId,
}: {
  results: any
  quiz: any
  questions: any[]
  selectedAnswers: Record<string, string[]>
  mode: TestMode
  onRetry: () => void
  userId: string | null
}) => {
  const router = useRouter()
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId)
    } else {
      newExpanded.add(questionId)
    }
    setExpandedQuestions(newExpanded)
  }

  const getPerformanceMessage = () => {
    if (results.percentage >= 90) {
      return { title: "Outstanding!", emoji: "🏆", color: "text-success", bg: "bg-mint" }
    } else if (results.percentage >= 75) {
      return { title: "Great Job!", emoji: "🌟", color: "text-brand", bg: "bg-lav" }
    } else if (results.percentage >= 60) {
      return { title: "Good Effort!", emoji: "💪", color: "text-warn", bg: "bg-butter" }
    } else {
      return { title: "Keep Practicing!", emoji: "📚", color: "text-destructive", bg: "bg-rose" }
    }
  }

  const performance = getPerformanceMessage()

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Results Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-xl border-0 overflow-hidden">
          <div className="bg-lav-2 text-on-pastel p-6 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Test Complete!</h1>
            <p className="text-muted-foreground">{quiz.title}</p>
          </div>

          <CardContent className="p-6">
            {/* Score Display */}
            <div className={cn("rounded-lg p-6 mb-6 text-center", performance.bg)}>
              <div className="text-4xl mb-2">{performance.emoji}</div>
              <h2 className={cn("text-2xl font-bold mb-4", performance.color)}>
                {performance.title}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mode === "exam" && results.satScore && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">{results.satScore}</div>
                    <div className="text-sm text-muted-foreground">SAT Score</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{results.percentage}%</div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {results.correctCount}/{results.totalQuestions}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {Math.floor(results.timeSpent / 60)}m
                  </div>
                  <div className="text-sm text-muted-foreground">Time</div>
                </div>
              </div>

              <div className="mt-4">
                {results.passed ? (
                  <Badge className="bg-mint text-on-pastel px-4 py-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Passed
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="px-4 py-2">
                    <XCircle className="h-4 w-4 mr-2" />
                    Not Passed
                  </Badge>
                )}
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Question Review</h3>
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[question.id] || []
                const isCorrect =
                  question.answers.length === userAnswer.length &&
                  question.answers.every((a: string) => userAnswer.includes(a))
                const isExpanded = expandedQuestions.has(question.id)

                return (
                  <div key={question.id} className="border rounded-lg overflow-hidden">
                    <div
                      onClick={() => toggleQuestion(question.id)}
                      className={cn(
                        "flex items-center justify-between p-4 cursor-pointer",
                        isCorrect ? "bg-mint" : "bg-rose"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">Q{index + 1}</span>
                        {isCorrect ? (
                          <Badge className="bg-mint text-foreground">Correct</Badge>
                        ) : (
                          <Badge variant="destructive">Incorrect</Badge>
                        )}
                      </div>
                      <ChevronRight
                        className={cn("h-5 w-5 transition-transform", isExpanded && "rotate-90")}
                      />
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-card space-y-4">
                        <div className="prose prose-sm max-w-none">
                          <ReadOnlyEditor initialContent={question.question} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-destructive mb-2">Your Answer:</h5>
                            {userAnswer.length > 0 ? (
                              userAnswer.map((ans: string, i: number) => (
                                <div key={i} className="bg-rose p-2 rounded text-sm text-foreground">
                                  {ans}
                                </div>
                              ))
                            ) : (
                              <div className="text-muted-foreground italic">No answer</div>
                            )}
                          </div>
                          {!isCorrect && (
                            <div>
                              <h5 className="font-medium text-success mb-2">Correct Answer:</h5>
                              {question.answers.map((ans: string, i: number) => (
                                <div key={i} className="bg-mint p-2 rounded text-sm text-foreground">
                                  {ans}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {question.note && (
                          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                            <h5 className="font-medium text-primary mb-2">Explanation:</h5>
                            <div className="prose prose-sm max-w-none text-foreground">
                              <ReadOnlyEditor initialContent={question.note} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              {userId && (
                <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Retake Test
                </Button>
              )}
              <Button onClick={() => router.push("/tests")} className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Back to Tests
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
