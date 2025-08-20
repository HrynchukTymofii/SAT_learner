"use client"

import {
  File,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  Lock,
  CheckCircle,
  Circle,
  HelpCircle,
  Star,
  Award,
  Users,
  Calendar,
  Clock,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { courseInfo } from "./course-page-data"
import ReviewsSection from "./reviews-section"
import LetsGoSection from "./letsgo-section"
import FaqSection from "./faq-section"

import StorySection from "./story-section"
import PromiseSection from "./promise-section"
import { LoginFirstModal } from "./login-require-madal"

interface CoursePageProps {
  course: any
  isEnrolled: boolean
  userId: string | null
}

const CoursePage = ({ course, isEnrolled, userId }: CoursePageProps) => {
  const [openChapters, setOpenChapters] = useState<string[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => (prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]))
  }

  const handleContentClick = (chapterId: string, contentId: string, contentType: string) => {
    // Navigate to content
    window.location.href = `/course/${chapterId}/${contentType}s/${contentId}`
  }

  const handleEnroll = () => {

  }

  // Calculate course progress
  const calculateProgress = () => {
    let totalItems = 0
    let completedItems = 0

    course.chapters.forEach((chapter: any) => {
      // Count lessons
      chapter.lessons.forEach((lesson: any) => {
        totalItems++
        if (lesson.progress && lesson.progress.length > 0 && lesson.progress[0].isCompleted) {
          completedItems++
        }
      })

      // Count quizzes
      chapter.quizzes.forEach((quiz: any) => {
        totalItems++
        if (quiz.results && quiz.results.length > 0 && quiz.results[0].isPassed) {
          completedItems++
        }
      })
    })

    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen w-full max-w-7xl">
      <div className="mx-auto px-4 py-8 ">
        {/* Hero Section - Video/Image and Enrollment Side by Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video/Image Section - Left Side */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden shadow-xl border-0 bg-white">
                <div className="relative">
                  {course.courseVideoUrl ? (
                    <div className="aspect-video">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${course.courseVideoUrl.split("v=")[1]}`}
                        title={course.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="aspect-video relative">
                      <Image
                        fill
                        className="object-cover"
                        alt={course.title}
                        src={course.imageUrl || "/placeholder.svg?height=600&width=1200&query=course"}
                      />
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Enrollment Card - Right Side */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="shadow-lg border-0 bg-white">
                  <CardContent className="p-6">
                    {/* Add course title here */}
                    <div className="mb-4">
                      <h1 className="text-2xl font-bold text-slate-900 mb-2">{course.title}</h1>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {courseInfo.level}
                      </Badge>
                    </div>

                    <div className="text-3xl font-bold mb-4">Free</div>

                    {/* Course Stats */}
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= 4 ? "fill-amber-400 text-amber-400" : "fill-muted stroke-muted-foreground"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">(128 reviews)</span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{courseInfo.students} students</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Updated {courseInfo.lastUpdated}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{courseInfo.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <span>Certificate</span>
                        </div>
                      </div>
                    </div>

                    {isEnrolled ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Your progress</span>
                            <span className="text-sm font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>

                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            // Find first incomplete lesson/quiz
                            let nextContent = null

                            for (const chapter of course.chapters) {
                              // Check lessons
                              for (const lesson of chapter.lessons) {
                                const isCompleted =
                                  lesson.progress && lesson.progress.length > 0 && lesson.progress[0].isCompleted
                                if (!isCompleted) {
                                  nextContent = { id: lesson.id, type: "lesson" }
                                  break
                                }
                              }

                              if (nextContent) break

                              // Check quizzes
                              for (const quiz of chapter.quizzes) {
                                const isPassed = quiz.results && quiz.results.length > 0 && quiz.results[0].isPassed
                                if (!isPassed) {
                                  nextContent = { id: quiz.id, type: "quiz" }
                                  break
                                }
                              }

                              if (nextContent) break
                            }

                            if (nextContent) {
                              window.location.href = `/courses/${course.id}/${nextContent.type}s/${nextContent.id}`
                            } 
                          }}
                        >
                          Continue Learning
                        </Button>
                      </div>
                    ) : 
                      userId ? (<Button
                        className="w-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 transition-all duration-300"
                        onClick={() => handleEnroll()}
                        
                      >
                        Enroll Now - It&apos;s Free
                      </Button>) :
                      (<Button
                        className="w-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 transition-all duration-300"
                          onClick={() => setShowLoginModal(true)}
                      >
                        Enroll Now - It&apos;s Free
                      </Button>)
                    }
                    <LoginFirstModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Full lifetime access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Access on mobile and desktop</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Certificate of completion</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Storytelling Section - Replace "Why This Course Rocks" */}
        <StorySection />

        {/* Course Content Section - Full Width */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="shadow-lg border-0 bg-white py-6 mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Course Content
              </CardTitle>
              <CardDescription>
                {course.chapters.length} chapters •{" "}
                {course.chapters.reduce(
                  (acc: number, chapter: any) => acc + chapter.lessons.length + chapter.quizzes.length,
                  0,
                )}{" "}
                lessons and quizzes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {course.chapters.map((chapter: any, chapterIndex: number) => (
                <Collapsible
                  key={chapter.id}
                  open={openChapters.includes(chapter.id)}
                  onOpenChange={() => toggleChapter(chapter.id)}
                  className="transition-all duration-200 ease-in-out"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto hover:bg-slate-50 rounded-lg border border-slate-200 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
                          {chapterIndex + 1}
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-slate-900">{chapter.title}</h4>
                          <p className="text-sm text-slate-500">
                            {chapter.lessons.length} lessons • {chapter.quizzes.length} quizzes
                          </p>
                        </div>
                      </div>
                      {openChapters.includes(chapter.id) ? (
                        <ChevronDown className="h-5 w-5 text-slate-400 transition-transform duration-200" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400 transition-transform duration-200" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-2 animate-slide-down">
                    <div className="ml-11 space-y-2 border-l-2 border-slate-100 pl-4">
                      {/* Lessons */}
                      {chapter.lessons.map((lesson: any, lessonIndex: number) => {
                        const isCompleted =
                          lesson.progress && lesson.progress.length > 0 && lesson.progress[0].isCompleted

                        return (
                          <motion.div
                            key={`lesson-${lesson.id}`}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: lessonIndex * 0.05 }}
                            className="relative group cursor-pointer"
                            onClick={() => handleContentClick(chapter.id, lesson.id, "lesson")}
                          >
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                              <div className="flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-600 rounded-full text-xs">
                                {lessonIndex + 1}
                              </div>
                              <Play className="h-4 w-4 text-slate-400" />
                              <div className="flex-1">
                                <h5 className="font-medium text-slate-700 group-hover:text-slate-900">
                                  {lesson.title}
                                </h5>
                              </div>
                              {isEnrolled ? (
                                isCompleted ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Circle className="h-4 w-4 text-slate-300" />
                                )
                              ) : (
                                <Lock className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                          </motion.div>
                        )
                      })}

                      {/* Quizzes */}
                      {chapter.quizzes.map((quiz: any, quizIndex: number) => {
                        const isPassed = quiz.results && quiz.results.length > 0 && quiz.results[0].isPassed

                        return (
                          <motion.div
                            key={`quiz-${quiz.id}`}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: (chapter.lessons.length + quizIndex) * 0.05 }}
                            className="relative group cursor-pointer"
                            onClick={() => handleContentClick(chapter.id, quiz.id, "quiz")}
                          >
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                              <div className="flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-600 rounded-full text-xs">
                                Q{quizIndex + 1}
                              </div>
                              <HelpCircle className="h-4 w-4 text-amber-400" />
                              <div className="flex-1">
                                <h5 className="font-medium text-slate-700 group-hover:text-slate-900">{quiz.title}</h5>
                              </div>
                              {isEnrolled ? (
                                isPassed ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                    Passed
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                                    Not taken
                                  </Badge>
                                )
                              ) : (
                                <Lock className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Move "By the End You'll..." section here - after Course Content */}
        <PromiseSection />
      </div>

      <div>
        {/* Student Reviews Section - New Vertical Card Styles */}
        <ReviewsSection />

        {/* Let's Go CTA Section - Move here after reviews */}
        <LetsGoSection />

        {/* FAQ Section */}
        <FaqSection />
      </div>
    </div>
  )
}

export default CoursePage
