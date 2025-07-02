"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  MessageCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Star,
  AlertCircle,
  Bookmark,
  ExternalLink,
  Send,
  Trophy,
  XCircle,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/lib/useAuth"
import { useRouter } from "next/navigation"

// Mock data types
interface ProgressData {
  courseProgress: number
  chapterProgress: number
  quizCompletion: number
  lastTest: {
    title: string
    score: number
    maxScore: number
    date: string
  }
  averageSATScore: number
  lessonsCompleted: number
  totalLessons: number
}

interface MistakeData {
  id: string
  questionExcerpt: string
  topic: string
  scoreImpact: number
  date: string
  difficulty: "easy" | "medium" | "hard"
}

interface SavedItem {
  id: string
  title: string
  type: "question" | "lesson" | "topic"
  category: string
  date: string
}

interface ChatMessage {
  id: string
  message: string
  isUser: boolean
  timestamp: string
}

// Mock data
const mockProgressData: ProgressData = {
  courseProgress: 68,
  chapterProgress: 45,
  quizCompletion: 72,
  lastTest: {
    title: "Math Practice Test #3",
    score: 650,
    maxScore: 800,
    date: "2024-01-15",
  },
  averageSATScore: 1280,
  lessonsCompleted: 24,
  totalLessons: 35,
}

const mockMistakes: MistakeData[] = [
  {
    id: "1",
    questionExcerpt: "If 3x + 2y = 12 and x - y = 1, what is the value of x?",
    topic: "Systems of Equations",
    scoreImpact: -15,
    date: "2024-01-15",
    difficulty: "medium",
  },
  {
    id: "2",
    questionExcerpt: "The author's primary purpose in the passage is to...",
    topic: "Reading Comprehension",
    scoreImpact: -10,
    date: "2024-01-14",
    difficulty: "hard",
  },
  {
    id: "3",
    questionExcerpt: "Which of the following best describes the function f(x) = x² - 4x + 3?",
    topic: "Quadratic Functions",
    scoreImpact: -12,
    date: "2024-01-13",
    difficulty: "easy",
  },
]

const mockSavedItems: SavedItem[] = [
  {
    id: "1",
    title: "Algebraic Expressions Practice",
    type: "question",
    category: "Math",
    date: "2024-01-15",
  },
  {
    id: "2",
    title: "Essay Writing Fundamentals",
    type: "lesson",
    category: "Writing",
    date: "2024-01-14",
  },
  {
    id: "3",
    title: "Critical Reading Strategies",
    type: "topic",
    category: "Reading",
    date: "2024-01-13",
  },
]

// Animated Circular Progress Component
const CircularProgress = ({
  value,
  size = 96,
  strokeWidth = 8,
  color = "blue",
  label,
  sublabel,
}: {
  value: number
  size?: number
  strokeWidth?: number
  color?: "blue" | "green" | "amber"
  label: string
  sublabel: string
}) => {
  const [animatedValue, setAnimatedValue] = useState(0)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    // Start animation after a short delay
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 300)

    // Animate the display number
    const duration = 2000 // 2 seconds
    const steps = 60 // 60 steps for smooth animation
    const increment = value / steps
    let currentStep = 0

    const numberTimer = setInterval(() => {
      currentStep++
      const currentValue = Math.min(increment * currentStep, value)
      setDisplayValue(Math.round(currentValue))

      if (currentStep >= steps) {
        clearInterval(numberTimer)
        setDisplayValue(value) // Ensure final value is exact
      }
    }, duration / steps)

    return () => {
      clearTimeout(timer)
      clearInterval(numberTimer)
    }
  }, [value])

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference

  const colorClasses = {
    blue: "stroke-blue-500",
    green: "stroke-green-500",
    amber: "stroke-amber-500",
  }

  const bgColorClasses = {
    blue: "stroke-blue-100",
    green: "stroke-green-100",
    amber: "stroke-amber-100",
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className={`fill-none ${bgColorClasses[color]}`}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={`fill-none ${colorClasses[color]} transition-all duration-[2000ms] ease-out`}
            style={{
              strokeDasharray,
              strokeDashoffset,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-slate-900 tabular-nums">{displayValue}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{sublabel}</p>
      </div>
    </div>
  )
}

// Score Badge Component
const ScoreBadge = ({ score, maxScore }: { score: number; maxScore: number }) => {
  const percentage = (score / maxScore) * 100
  let bgColor = "bg-amber-50 text-amber-700 hover:bg-amber-50"

  if (percentage >= 80) {
    bgColor = "bg-green-50 text-green-700 hover:bg-green-50"
  } else if (percentage < 60) {
    bgColor = "bg-red-50 text-red-700 hover:bg-red-50"
  }

  return (
    <Badge variant="outline" className={bgColor}>
      {score}/{maxScore}
    </Badge>
  )
}

// Animated Number Component
const AnimatedNumber = ({
  value,
  className = "",
  duration = 2000,
}: {
  value: number
  className?: string
  duration?: number
}) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const steps = 60
    const increment = value / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const currentValue = Math.min(increment * currentStep, value)
      setDisplayValue(Math.round(currentValue))

      if (currentStep >= steps) {
        clearInterval(timer)
        setDisplayValue(value)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, duration])

  return <span className={`tabular-nums ${className}`}>{displayValue}</span>
}

// Animated Progress Bar Component
const AnimatedProgress = ({
  value,
  className = "",
}: {
  value: number
  className?: string
}) => {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value)
    }, 500)

    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className={`bg-slate-200 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-[2000ms] ease-out"
        style={{ width: `${animatedValue}%` }}
      />
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuth();
  const router = useRouter();

  if (!user.isPro){
    router.push('/');
  }
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      message: "Hi! I'm your SAT tutor. How can I help you today?",
      isUser: false,
      timestamp: new Date().toISOString(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: newMessage,
      isUser: true,
      timestamp: new Date().toISOString(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setNewMessage("")

    // Simulate tutor response
    setTimeout(() => {
      const tutorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message:
          "That's a great question! Let me help you understand this concept better. Would you like me to break it down step by step?",
        isUser: false,
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, tutorResponse])
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2">SAT Prep Dashboard</h1>
          <p className="text-slate-600">Track your progress and continue your SAT preparation journey</p>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="space-y-6">
          {/* Top Section - Progress Overview and Performance Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="shadow-lg border-0 bg-white py-4">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Your Progress & Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Progress Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CircularProgress
                      value={mockProgressData.courseProgress}
                      color="blue"
                      label="Course Progress"
                      sublabel="Overall completion"
                    />
                    <CircularProgress
                      value={mockProgressData.chapterProgress}
                      color="green"
                      label="Chapter Progress"
                      sublabel="Current chapter"
                    />
                    <CircularProgress
                      value={mockProgressData.quizCompletion}
                      color="amber"
                      label="Quiz Completion"
                      sublabel="Practice tests"
                    />
                  </div>

                  {/* Performance Summary */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Performance Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <motion.div
                        className="bg-slate-50 rounded-lg p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-600">Last Test</span>
                          <Calendar className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="font-semibold text-slate-900">{mockProgressData.lastTest.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <ScoreBadge
                            score={mockProgressData.lastTest.score}
                            maxScore={mockProgressData.lastTest.maxScore}
                          />
                          <span className="text-xs text-slate-500">
                            {new Date(mockProgressData.lastTest.date).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>

                      <motion.div
                        className="bg-slate-50 rounded-lg p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-600">Average SAT Score</span>
                          <Trophy className="h-4 w-4 text-slate-400" />
                        </div>
                        <AnimatedNumber
                          value={mockProgressData.averageSATScore}
                          className="text-2xl font-bold text-slate-900"
                        />
                        <p className="text-xs text-slate-500">Based on practice tests</p>
                      </motion.div>

                      <motion.div
                        className="bg-slate-50 rounded-lg p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-600">Lessons Completed</span>
                          <BookOpen className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">
                          <AnimatedNumber value={mockProgressData.lessonsCompleted} />/{mockProgressData.totalLessons}
                        </p>
                        <AnimatedProgress
                          value={(mockProgressData.lessonsCompleted / mockProgressData.totalLessons) * 100}
                          className="h-2 mt-2"
                        />
                      </motion.div>

                      <motion.div
                        className="bg-slate-50 rounded-lg p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-600">Study Streak</span>
                          <Star className="h-4 w-4 text-slate-400" />
                        </div>
                        <p className="text-2xl font-bold text-slate-900">
                          <AnimatedNumber value={7} /> days
                        </p>
                        <p className="text-xs text-slate-500">Keep it up!</p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bottom Section - Interactive Features in Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Ask a Tutor and Recent Mistakes */}
            <div className="space-y-6">
              {/* Ask a Tutor - Chat UI */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="shadow-lg border-0 bg-white py-4">
                  <Collapsible open={isChatOpen} onOpenChange={setIsChatOpen}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                        <CardTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-blue-600" />
                            Ask a Tutor
                          </div>
                          {isChatOpen ? (
                            <ChevronUp className="h-4 w-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          )}
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Chat Messages */}
                          <div className="h-64 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-lg">
                            {chatMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[80%] p-3 rounded-lg ${
                                    message.isUser ? "bg-blue-600 text-white" : "bg-white text-slate-900 border"
                                  }`}
                                >
                                  <p className="text-sm">{message.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Chat Input */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Ask your tutor a question..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                              className="flex-1"
                            />
                            <Button onClick={sendMessage} size="icon" className="bg-blue-600 hover:bg-blue-700">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </motion.div>

              {/* Mistakes Review */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="shadow-lg border-0 bg-white py-4">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Recent Mistakes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockMistakes.map((mistake) => (
                        <div key={mistake.id} className="border rounded-lg p-3 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-medium text-slate-900 line-clamp-2">{mistake.questionExcerpt}</p>
                            <Badge
                              variant="outline"
                              className={
                                mistake.difficulty === "easy"
                                  ? "bg-green-50 text-green-700 hover:bg-green-50"
                                  : mistake.difficulty === "medium"
                                    ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
                                    : "bg-red-50 text-red-700 hover:bg-red-50"
                              }
                            >
                              {mistake.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>{mistake.topic}</span>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <XCircle className="h-3 w-3 text-red-500" />
                                {mistake.scoreImpact}
                              </span>
                              <span>{new Date(mistake.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Saved Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="shadow-lg border-0 bg-white h-fit py-4">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-amber-600" />
                    Saved Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="questions" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="questions">Questions</TabsTrigger>
                      <TabsTrigger value="lessons">Lessons</TabsTrigger>
                      <TabsTrigger value="topics">Topics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="questions" className="mt-4">
                      <div className="space-y-3">
                        {mockSavedItems
                          .filter((item) => item.type === "question")
                          .map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <div>
                                <p className="font-medium text-slate-900">{item.title}</p>
                                <p className="text-xs text-slate-500">{item.category}</p>
                              </div>
                              <Button size="sm" variant="outline">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Go to
                              </Button>
                            </div>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="lessons" className="mt-4">
                      <div className="space-y-3">
                        {mockSavedItems
                          .filter((item) => item.type === "lesson")
                          .map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <div>
                                <p className="font-medium text-slate-900">{item.title}</p>
                                <p className="text-xs text-slate-500">{item.category}</p>
                              </div>
                              <Button size="sm" variant="outline">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Go to
                              </Button>
                            </div>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="topics" className="mt-4">
                      <div className="space-y-3">
                        {mockSavedItems
                          .filter((item) => item.type === "topic")
                          .map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <div>
                                <p className="font-medium text-slate-900">{item.title}</p>
                                <p className="text-xs text-slate-500">{item.category}</p>
                              </div>
                              <Button size="sm" variant="outline">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Go to
                              </Button>
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
