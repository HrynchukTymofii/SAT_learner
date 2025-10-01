"use client"

import { useState, useEffect, useTransition } from "react"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Edit3,
  Trophy,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Star,
  Award,
  Settings,
  Lock,
  CreditCard,
  LogOut,
  Camera,
  Shield,
  Zap,
  Brain,
  Clock,
  CheckCircle,
  GraduationCap,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/useAuth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { signOut } from "next-auth/react"

// Mock user data
const mockUserData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  avatar: "/placeholder.svg?height=120&width=120",
  league: "Pro",
  joinDate: "2023-09-15",
  stats: {
    totalPoints: 2847,
    lessonsCompleted: 42,
    quizzesTaken: 28,
    averageSATScore: 1340,
  },
  progress: {
    courseProgress: 78,
    chapterProgress: 65,
    completedModules: 15,
    totalModules: 20,
  },
  achievements: [
    {
      id: 1,
      title: "First Steps",
      description: "Completed First Lesson",
      icon: BookOpen,
      unlocked: true,
      color: "blue",
    },
    { id: 2, title: "High Scorer", description: "Scored 700+", icon: Trophy, unlocked: true, color: "amber" },
    {
      id: 3,
      title: "Consistent",
      description: "Active 7 days straight",
      icon: Calendar,
      unlocked: true,
      color: "green",
    },
    { id: 4, title: "Math Master", description: "Aced 10 Math quizzes", icon: Brain, unlocked: true, color: "purple" },
    {
      id: 5,
      title: "Speed Reader",
      description: "Complete 5 Reading sections under time",
      icon: Zap,
      unlocked: false,
      color: "gray",
    },
    {
      id: 6,
      title: "Perfect Practice",
      description: "Score 100% on any quiz",
      icon: Star,
      unlocked: false,
      color: "gray",
    },
  ],
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

  return <Progress value={animatedValue} className={`transition-all duration-[2000ms] ease-out ${className}`} />
}

// League Badge Component
const LeagueBadge = ({ league }: { league: string }) => {
  const getBadgeStyle = (league: string) => {
    switch (league.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "intermediate":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pro":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  return (
    <Badge variant="outline" className={`${getBadgeStyle(league)} font-semibold px-3 py-1`}>
      <Shield className="h-3 w-3 mr-1" />
      {league}
    </Badge>
  )
}

// Achievement Badge Component
const AchievementBadge = ({
  achievement,
  delay = 0,
}: {
  achievement: (typeof mockUserData.achievements)[0]
  delay?: number
}) => {
  const Icon = achievement.icon
  const colorClasses = {
    blue: achievement.unlocked
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-slate-100 text-slate-400 border-slate-200",
    amber: achievement.unlocked
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-400 border-slate-200",
    green: achievement.unlocked
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-slate-100 text-slate-400 border-slate-200",
    purple: achievement.unlocked
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : "bg-slate-100 text-slate-400 border-slate-200",
    gray: "bg-slate-100 text-slate-400 border-slate-200",
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={`relative p-4 rounded-xl border-2 transition-all hover:scale-105 ${
        colorClasses[achievement.color as keyof typeof colorClasses]
      } ${achievement.unlocked ? "cursor-pointer" : "cursor-not-allowed"}`}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <div className={`p-3 rounded-full ${achievement.unlocked ? "bg-white/50" : "bg-slate-200/50"}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">{achievement.title}</h4>
          <p className="text-xs opacity-75">{achievement.description}</p>
        </div>
        {achievement.unlocked && (
          <CheckCircle className="absolute -top-2 -right-2 h-5 w-5 text-green-600 bg-white rounded-full" />
        )}
      </div>
    </motion.div>
  )
}

export default function UserProfilePage() {
  const {user, isPro} = useAuth();
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  if(!user){
    router.push('/');
    return
  }

  const handleLogout = () => {
      startTransition(() => {
        signOut({
          callbackUrl: "/",
        }).catch(() => {
          toast.error("Помилка", {
            description: "Не вдалося вийти з акаунту",
          })
        })
      })
    }
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Profile Image */}
                <div className="relative">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-lg">
                    <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || 'Student'} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {user.name ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("") : <GraduationCap />}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white shadow-md hover:bg-slate-50"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{user.name || 'Student'}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-600">{user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start gap-3">
                    {isPro && <LeagueBadge league={isPro ? 'Pro' : ''} />}
                    <Badge variant="outline" className="bg-white/50 text-slate-700">
                      <Calendar className="h-3 w-3 mr-1" />
                      Joined{" "}
                      {new Date(mockUserData.joinDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </Badge>
                  </div>
                </div>

                {/* Edit Button */}
                <Button variant="outline" className="bg-white/50 hover:bg-white/75 border-white/50">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="shadow-lg border-0 bg-white py-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <AnimatedNumber
                    value={mockUserData.stats.totalPoints}
                    className="text-2xl font-bold text-slate-900 block"
                  />
                  <p className="text-sm text-slate-600">Total Points</p>
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <AnimatedNumber
                    value={mockUserData.stats.lessonsCompleted}
                    className="text-2xl font-bold text-slate-900 block"
                  />
                  <p className="text-sm text-slate-600">Lessons Done</p>
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <AnimatedNumber
                    value={mockUserData.stats.quizzesTaken}
                    className="text-2xl font-bold text-slate-900 block"
                  />
                  <p className="text-sm text-slate-600">Quizzes Taken</p>
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Star className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <AnimatedNumber
                    value={mockUserData.stats.averageSATScore}
                    className="text-2xl font-bold text-slate-900 block"
                  />
                  <p className="text-sm text-slate-600">Avg SAT Score</p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Area */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-900">Overall Course Progress</span>
                  <span className="text-sm font-semibold text-blue-600">{mockUserData.progress.courseProgress}%</span>
                </div>
                <AnimatedProgress value={mockUserData.progress.courseProgress} className="h-3" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-900">Current Chapter</span>
                  <span className="text-sm font-semibold text-green-600">{mockUserData.progress.chapterProgress}%</span>
                </div>
                <AnimatedProgress value={mockUserData.progress.chapterProgress} className="h-3" />
              </div>


              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Modules Completed</p>
                    <p className="text-sm text-slate-600">Keep up the great work!</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                  <AnimatedNumber value={mockUserData.progress.completedModules} />/{mockUserData.progress.totalModules}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div> */}

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-lg border-0 bg-white py-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-600" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockUserData.achievements.map((achievement, index) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} delay={index * 0.1} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings & Account Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="shadow-lg border-0 bg-white py-6">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-slate-600" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-12 hover:bg-slate-50 bg-transparent">
                  <User className="h-4 w-4 mr-3" />
                  Edit Profile
                </Button>

                <Button variant="outline" className="justify-start h-12 hover:bg-slate-50 bg-transparent">
                  <Lock className="h-4 w-4 mr-3" />
                  Change Password
                </Button>

                <Button variant="outline" className="justify-start h-12 hover:bg-slate-50 bg-transparent">
                  <CreditCard className="h-4 w-4 mr-3" />
                  Manage Subscription
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-12 hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-transparent"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
