"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Target,
  CheckCircle,
  XCircle,
  Lightbulb,
  Grid3X3,
  RotateCcw,
  Trophy,
  ArrowRight,
  AlertCircle,
  Send,
  Home,
  BookOpen,
  ClipboardList,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ReadOnlyEditor } from "@/components/tiptap-templates/simple/readonly-editor"
import Image from "next/image"
import toast from "react-hot-toast"
import axios from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"

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

interface NavItem {
  id: string
  title: string
  type: "lesson" | "quiz"
  position: number
}

interface EnhancedQuizProps {
  quiz: any
  questions: Question[]
  courseId: string
  chapterId: string
  userId: string
  existingResult: any
  chapterTitle?: string
  currentIndex?: number
  totalItems?: number
  prevItem?: NavItem | null
  nextItem?: NavItem | null
}

export const EnhancedQuiz = ({
  quiz,
  questions,
  courseId,
  chapterId,
  userId,
  existingResult,
  chapterTitle = "Chapter",
  currentIndex = 0,
  totalItems = 1,
  prevItem,
  nextItem,
}: EnhancedQuizProps) => {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({})
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)

  // Timer
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState(Date.now())

  // Modals
  const [isHintModalOpen, setIsHintModalOpen] = useState(false)
  const [isGridModalOpen, setIsGridModalOpen] = useState(false)

  // Grid-in input
  const [gridInValue, setGridInValue] = useState("")

  const currentQuestion = questions[currentQuestionIndex]
  const isGridIn = currentQuestion?.questionType === "grid_in"
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const isAnswered = currentQuestion?.id in answeredQuestions

  // Timer effect
  useEffect(() => {
    if (showResults) return

    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime, showResults])

  // Load existing answers
  useEffect(() => {
    if (existingResult?.answers) {
      const answers = existingResult.answers as Record<string, string[]>
      setSelectedAnswers(answers)

      // Mark questions as answered with correct/incorrect status
      const answered: Record<string, boolean> = {}
      Object.keys(answers).forEach((questionId) => {
        const question = questions.find((q) => q.id === questionId)
        if (question && answers[questionId]?.length > 0) {
          const isCorrect = checkIsCorrect(question.answers, answers[questionId])
          answered[questionId] = isCorrect
        }
      })
      setAnsweredQuestions(answered)

      // Find first unanswered question
      const firstUnanswered = questions.findIndex((q) => !answers[q.id]?.length)
      if (firstUnanswered >= 0) {
        setCurrentQuestionIndex(firstUnanswered)
      }
    }
  }, [existingResult, questions])

  const checkIsCorrect = (correctAnswers: string[], userAnswers: string[]): boolean => {
    if (!userAnswers || userAnswers.length === 0) return false
    return (
      correctAnswers.length === userAnswers.length &&
      correctAnswers.every((a) => userAnswers.includes(a))
    )
  }

  const handleAnswerSelect = (option: string) => {
    // Don't allow changing answered questions
    if (answeredQuestions[currentQuestion.id] !== undefined) return

    const questionId = currentQuestion.id
    const newAnswers = {
      ...selectedAnswers,
      [questionId]: [option],
    }
    setSelectedAnswers(newAnswers)

    // Auto-check answer and show feedback
    const isCorrect = checkIsCorrect(currentQuestion.answers, [option])
    setAnsweredQuestions((prev) => ({
      ...prev,
      [questionId]: isCorrect,
    }))

    if (isCorrect) {
      toast.success("Correct!", { duration: 1500, icon: "✅" })
    } else {
      toast.error("Incorrect", { duration: 1500, icon: "❌" })
    }

    // Save answer to server in background
    saveAnswer(questionId, [option])
  }

  const handleGridInSubmit = () => {
    if (!gridInValue.trim() || isAnswered) return

    const questionId = currentQuestion.id
    const userAnswer = gridInValue.trim()
    const newAnswers = {
      ...selectedAnswers,
      [questionId]: [userAnswer],
    }
    setSelectedAnswers(newAnswers)

    // Check if answer is correct (case-insensitive, trim whitespace)
    const isCorrect = currentQuestion.answers.some(
      (ans) => ans.trim().toLowerCase() === userAnswer.toLowerCase()
    )
    setAnsweredQuestions((prev) => ({
      ...prev,
      [questionId]: isCorrect,
    }))

    if (isCorrect) {
      toast.success("Correct!", { duration: 1500, icon: "✅" })
    } else {
      toast.error("Incorrect", { duration: 1500, icon: "❌" })
    }

    // Save answer to server
    saveAnswer(questionId, [userAnswer])
    setGridInValue("")
  }

  const saveAnswer = async (questionId: string, answer: string[]) => {
    try {
      await axios.patch("/api/user/course/quiz", {
        userId,
        quizId: quiz.id,
        answers: { ...selectedAnswers, [questionId]: answer },
        timeSpent,
      })
    } catch (error) {
      console.error("Error saving answer:", error)
    }
  }

  const nextQuestion = () => {
    // Find next unanswered question
    for (let i = currentQuestionIndex + 1; i < questions.length; i++) {
      if (!(questions[i].id in answeredQuestions)) {
        setCurrentQuestionIndex(i)
        return
      }
    }
    // If all after are answered, check before
    for (let i = 0; i < currentQuestionIndex; i++) {
      if (!(questions[i].id in answeredQuestions)) {
        setCurrentQuestionIndex(i)
        return
      }
    }
    // All answered, go to next
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const submitResults = async () => {
    setIsSubmitting(true)

    try {
      // Calculate results
      let correctCount = 0
      let totalPoints = 0
      let earnedPoints = 0

      questions.forEach((q) => {
        totalPoints += q.points
        const userAns = selectedAnswers[q.id] || []
        if (checkIsCorrect(q.answers, userAns)) {
          correctCount++
          earnedPoints += q.points
        }
      })

      const percentage = Math.round((correctCount / questions.length) * 100)
      const passed = percentage >= 70

      setResults({
        correctCount,
        totalQuestions: questions.length,
        percentage,
        passed,
        earnedPoints,
        totalPoints,
        timeSpent,
      })
      setShowResults(true)

      // Save final result
      await axios.post("/api/user/course/quiz", {
        userId,
        quizId: quiz.id,
        answers: selectedAnswers,
        timeSpent,
      })

      toast.success("Quiz completed!")
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast.error("Error saving results")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = async () => {
    try {
      await axios.delete("/api/user/course/quiz", {
        data: { userId, quizId: quiz.id },
      })

      setSelectedAnswers({})
      setAnsweredQuestions({})
      setCurrentQuestionIndex(0)
      setShowResults(false)
      setResults(null)
      toast.success("Quiz reset!")
    } catch (error) {
      console.error("Error resetting quiz:", error)
      toast.error("Error resetting quiz")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const answeredCount = Object.keys(answeredQuestions).length
  const correctCount = Object.values(answeredQuestions).filter(Boolean).length

  // Results screen
  if (showResults && results) {
    return (
      <QuizResults
        results={results}
        quiz={quiz}
        questions={questions}
        selectedAnswers={selectedAnswers}
        onRetry={handleRetry}
        chapterId={chapterId}
        nextItem={nextItem}
      />
    )
  }

  if (!currentQuestion) {
    return <div className="p-8 text-center">No questions available</div>
  }

  const navigateToItem = (item: NavItem) => {
    const url = item.type === "lesson"
      ? `/course/${chapterId}/lessons/${item.id}`
      : `/course/${chapterId}/quizzes/${item.id}`
    router.push(url)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/course" className="hover:text-foreground flex items-center gap-1">
          <Home className="w-4 h-4" />
          Course
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">{chapterTitle}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{quiz.title}</span>
      </nav>

      {/* Chapter Progress */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-purple-500" />
          <span className="text-sm font-medium">Quiz</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalItems}
          </span>
        </div>
      </div>

      {/* Header */}
      <Card className="shadow-sm border-0 bg-card">
        <CardContent className="p-4 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {prevItem && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateToItem(prevItem)}
                  title={`Previous: ${prevItem.title}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h1 className="text-lg font-bold text-foreground">{quiz.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">
                    Question {currentQuestionIndex + 1} / {questions.length}
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                    {correctCount} correct
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-mono font-semibold">{formatTime(timeSpent)}</span>
              </div>

              {/* Question Grid Button */}
              <Button variant="outline" size="sm" onClick={() => setIsGridModalOpen(true)}>
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-1.5 mt-4" />
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
              <CardHeader className="pb-2 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      {currentQuestionIndex + 1}
                    </div>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                      {currentQuestion.points} pts
                    </Badge>
                  </div>
                  {/* Hint Button */}
                  {currentQuestion.hint && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsHintModalOpen(true)}
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    >
                      <Lightbulb className="h-5 w-5 fill-amber-200" />
                      <span className="ml-1 text-sm">Hint</span>
                    </Button>
                  )}
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
          <CardHeader className="pb-2 pt-5">
            <CardTitle className="text-lg text-foreground">
              {isGridIn ? "Enter your answer" : "Choose your answer"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-5">
            {isGridIn ? (
              /* Grid-In Question Type */
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Write your answer as a number (e.g., 3.14 or 42)
                  </p>
                </div>

                {!isAnswered ? (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="Enter your answer..."
                      value={gridInValue}
                      onChange={(e) => setGridInValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGridInSubmit()}
                      className="flex-1 text-lg h-12 bg-background"
                    />
                    <Button
                      onClick={handleGridInSubmit}
                      disabled={!gridInValue.trim()}
                      className="h-12 px-6 bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "p-4 rounded-lg border-2",
                      answeredQuestions[currentQuestion.id]
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {answeredQuestions[currentQuestion.id] ? (
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          Your answer: {selectedAnswers[currentQuestion.id]?.[0]}
                        </p>
                        {!answeredQuestions[currentQuestion.id] && (
                          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                            Correct answer: {currentQuestion.answers[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Multiple Choice Options */
              currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion.id]?.includes(option)
                const isCorrectOption = currentQuestion.answers.includes(option)
                const showFeedback = isAnswered

                let optionStyle = "bg-muted/50 border-border hover:bg-muted hover:border-muted-foreground/30"
                if (isSelected && !showFeedback) {
                  optionStyle = "bg-blue-500/10 border-blue-500/30"
                } else if (showFeedback && isCorrectOption) {
                  optionStyle = "bg-green-500/10 border-green-500/30"
                } else if (showFeedback && isSelected && !isCorrectOption) {
                  optionStyle = "bg-red-500/10 border-red-500/30"
                }

                return (
                  <div
                    key={index}
                    onClick={() => !isAnswered && handleAnswerSelect(option)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                      optionStyle,
                      isAnswered ? "cursor-default" : "cursor-pointer"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0",
                        isSelected && !showFeedback && "bg-blue-600 text-white",
                        showFeedback && isCorrectOption && "bg-green-600 text-white",
                        showFeedback && isSelected && !isCorrectOption && "bg-red-600 text-white",
                        !isSelected && !showFeedback && "bg-muted text-muted-foreground"
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 text-foreground">{option}</span>
                    {showFeedback && isCorrectOption && (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    )}
                    {showFeedback && isSelected && !isCorrectOption && (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                  </div>
                )
              })
            )}
          </CardContent>

          {/* Explanation - shown after answering */}
          {isAnswered && currentQuestion.note && (
            <CardContent className="pt-0 pb-5">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Explanation</h4>
                    <div className="prose prose-sm max-w-none text-purple-800 dark:text-purple-200">
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
        <CardContent className="p-4 py-5">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {answeredCount} of {questions.length} answered
            </div>

            <div className="flex gap-3">
              {answeredCount === questions.length ? (
                <Button
                  onClick={submitResults}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Target className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Finish Quiz"}
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  {isAnswered ? "Next" : "Skip"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hint Modal */}
      <Dialog open={isHintModalOpen} onOpenChange={setIsHintModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Lightbulb className="h-5 w-5 text-amber-500 fill-amber-500" />
              Hint
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {currentQuestion.hint && (
              <div className="prose prose-sm max-w-none">
                <ReadOnlyEditor initialContent={currentQuestion.hint} />
              </div>
            )}
            {currentQuestion.hintImageUrl && (
              <Image
                src={currentQuestion.hintImageUrl}
                alt="Hint illustration"
                width={400}
                height={300}
                className="rounded-lg border max-w-full h-auto"
              />
            )}
            <Button onClick={() => setIsHintModalOpen(false)} className="w-full bg-cyan-600 hover:bg-cyan-700">
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Question Grid Modal */}
      <Dialog open={isGridModalOpen} onOpenChange={setIsGridModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Grid3X3 className="h-5 w-5" />
              All Questions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-foreground">{answeredCount}</div>
                <div className="text-xs text-muted-foreground">Answered</div>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{correctCount}</div>
                <div className="text-xs text-green-700 dark:text-green-400">Correct</div>
              </div>
              <div className="text-center p-3 bg-red-500/10 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {answeredCount - correctCount}
                </div>
                <div className="text-xs text-red-700 dark:text-red-400">Incorrect</div>
              </div>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const qAnswered = question.id in answeredQuestions
                const isCorrect = answeredQuestions[question.id]
                const isCurrent = index === currentQuestionIndex

                return (
                  <Button
                    key={question.id}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentQuestionIndex(index)
                      setIsGridModalOpen(false)
                    }}
                    className={cn(
                      "relative w-12 h-12 p-0 font-semibold transition-all",
                      isCurrent && "ring-2 ring-blue-500 bg-blue-500/10 border-blue-500/30",
                      qAnswered && isCorrect && "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400",
                      qAnswered && !isCorrect && "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                    )}
                  >
                    {index + 1}
                    {qAnswered && (
                      <div className="absolute -top-1 -right-1">
                        {isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600 fill-green-100" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 fill-red-100" />
                        )}
                      </div>
                    )}
                  </Button>
                )
              })}
            </div>

            <Button variant="outline" onClick={() => setIsGridModalOpen(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Results Component
const QuizResults = ({
  results,
  quiz,
  questions,
  selectedAnswers,
  onRetry,
  chapterId,
  nextItem,
}: {
  results: any
  quiz: any
  questions: Question[]
  selectedAnswers: Record<string, string[]>
  onRetry: () => void
  chapterId: string
  nextItem?: NavItem | null
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
      return { title: "Outstanding!", emoji: "🏆", color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" }
    } else if (results.percentage >= 70) {
      return { title: "Great Job!", emoji: "🌟", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" }
    } else if (results.percentage >= 50) {
      return { title: "Good Effort!", emoji: "💪", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" }
    } else {
      return { title: "Keep Practicing!", emoji: "📚", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" }
    }
  }

  const performance = getPerformanceMessage()

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="shadow-xl border-0 overflow-hidden bg-card">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Quiz Complete!</h1>
            <p className="text-purple-100">{quiz.title}</p>
          </div>

          <CardContent className="p-6">
            {/* Score Display */}
            <div className={cn("rounded-lg p-6 mb-6 text-center", performance.bg)}>
              <div className="text-4xl mb-2">{performance.emoji}</div>
              <h2 className={cn("text-2xl font-bold mb-4", performance.color)}>
                {performance.title}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    {results.earnedPoints}/{results.totalPoints}
                  </div>
                  <div className="text-sm text-muted-foreground">Points</div>
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
                  <Badge className="bg-green-600 text-white px-4 py-2">
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
              <h3 className="text-lg font-semibold text-foreground">Question Review</h3>
              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[question.id] || []
                const isCorrect =
                  question.answers.length === userAnswer.length &&
                  question.answers.every((a) => userAnswer.includes(a))
                const isExpanded = expandedQuestions.has(question.id)

                return (
                  <div key={question.id} className="border border-border rounded-lg overflow-hidden">
                    <div
                      onClick={() => toggleQuestion(question.id)}
                      className={cn(
                        "flex items-center justify-between p-4 cursor-pointer transition-colors",
                        isCorrect ? "bg-green-500/10 hover:bg-green-500/20" : "bg-red-500/10 hover:bg-red-500/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">Q{index + 1}</span>
                        {isCorrect ? (
                          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Incorrect
                          </Badge>
                        )}
                      </div>
                      <ChevronRight
                        className={cn("h-5 w-5 transition-transform text-muted-foreground", isExpanded && "rotate-90")}
                      />
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-card space-y-4 border-t border-border">
                        <div className="prose prose-sm max-w-none">
                          <ReadOnlyEditor initialContent={question.question} />
                        </div>

                        {question.questionImageUrl && (
                          <Image
                            src={question.questionImageUrl}
                            alt="Question"
                            width={400}
                            height={question.imageHeight || 200}
                            className="rounded-lg border"
                          />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className={cn("font-medium mb-2", isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                              Your Answer:
                            </h5>
                            {userAnswer.length > 0 ? (
                              userAnswer.map((ans, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "p-2 rounded text-sm text-foreground",
                                    isCorrect ? "bg-green-500/10" : "bg-red-500/10"
                                  )}
                                >
                                  {ans}
                                </div>
                              ))
                            ) : (
                              <div className="text-muted-foreground italic text-sm">No answer</div>
                            )}
                          </div>
                          {!isCorrect && (
                            <div>
                              <h5 className="font-medium text-green-600 dark:text-green-400 mb-2">Correct Answer:</h5>
                              {question.answers.map((ans, i) => (
                                <div key={i} className="bg-green-500/10 p-2 rounded text-sm text-foreground">
                                  {ans}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {question.note && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              Explanation
                            </h5>
                            <div className="prose prose-sm max-w-none text-blue-800 dark:text-blue-200">
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
              <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
              {nextItem ? (
                <Button
                  onClick={() => {
                    const url = nextItem.type === "lesson"
                      ? `/course/${chapterId}/lessons/${nextItem.id}`
                      : `/course/${chapterId}/quizzes/${nextItem.id}`
                    router.push(url)
                  }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {nextItem.type === "lesson" ? (
                    <BookOpen className="h-4 w-4" />
                  ) : (
                    <ClipboardList className="h-4 w-4" />
                  )}
                  Next: {nextItem.title.length > 20 ? nextItem.title.slice(0, 20) + "..." : nextItem.title}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={() => router.push("/course")} className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Back to Course
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
