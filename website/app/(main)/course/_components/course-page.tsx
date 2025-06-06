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
  MessageSquare,
  Award,
  Users,
  Calendar,
  Clock,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import { Loader } from "@/components/loader"
import { motion } from "framer-motion"
import { ReadOnlyEditor } from "@/components/tiptap-templates/simple/readonly-editor"

interface CoursePageProps {
  course: any
  attachments: any[]
  isEnrolled: boolean
  userId: string
}

const CoursePage = ({ course, attachments, isEnrolled }: CoursePageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [openChapters, setOpenChapters] = useState<string[]>([])
  const [showEnrollPrompt, setShowEnrollPrompt] = useState(false)
  const [activeTab, setActiveTab] = useState("content")

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Open the first chapter by default
      if (course.chapters.length > 0) {
        setOpenChapters([course.chapters[0].id])
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [course.chapters])

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => (prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]))
  }

  const handleContentClick = (chapterId: string, contentId: string, contentType: string) => {
    if (!isEnrolled) {
      setShowEnrollPrompt(true)
      return
    }
    // Navigate to content
    window.location.href = `/course/${chapterId}/${contentType}s/${contentId}`
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

  // Mock data for hardcoded sections
  const reviews = [
    {
      id: 1,
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "2 months ago",
      comment:
        "This course exceeded my expectations. The content is well-structured and the instructor explains complex concepts in a simple way. I've learned so much!",
    },
    {
      id: 2,
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4,
      date: "3 weeks ago",
      comment:
        "Great course overall. I particularly enjoyed the practical exercises and real-world examples. Highly recommend to anyone starting out.",
    },
    {
      id: 3,
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "1 month ago",
      comment:
        "The quizzes really helped reinforce the concepts. I feel much more confident in my skills after completing this course. Worth every minute!",
    },
    {
      id: 4,
      name: "Emily Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Fantastic instructor and amazing content! The step-by-step approach made everything so easy to understand.",
    },
    {
      id: 5,
      name: "David Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4,
      date: "1 week ago",
      comment: "Really enjoyed this course. The practical projects were especially helpful in applying what I learned.",
    },
    {
      id: 6,
      name: "Lisa Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 5,
      date: "4 days ago",
      comment:
        "Best online course I've taken! Clear explanations, great examples, and excellent support from the community.",
    },
  ]

  const faqs = [
    {
      question: "How long do I have access to the course?",
      answer: "You will have lifetime access to this course once enrolled. You can revisit the material anytime.",
    },
    {
      question: "Are there any prerequisites for this course?",
      answer:
        "Basic knowledge of the subject matter is helpful but not required. The course is designed to accommodate beginners.",
    },
    {
      question: "Can I download the course materials for offline viewing?",
      answer:
        "Yes, all lesson materials and resources are available for download so you can learn at your own pace, even offline.",
    },
    {
      question: "Is there a certificate upon completion?",
      answer: "Yes, you will receive a certificate of completion once you finish all the lessons and pass all quizzes.",
    },
    {
      question: "How do I get help if I'm stuck on a lesson?",
      answer:
        "You can use the comment section below each lesson to ask questions. Our instructors typically respond within 24-48 hours.",
    },
  ]

  const courseInfo = {
    level: "Intermediate",
    students: "2,345",
    lastUpdated: "June 2023",
    duration: "12 hours",
    language: "English",
    certificate: true,
  }

  if (isLoading) {
    return <CoursePageSkeleton />
  }

  return (
    <div className="min-h-screen w-full max-w-7xl">
      <div className="mx-auto px-4 py-8 ">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
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
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Title and Info */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="shadow-lg border-0 bg-white py-6">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-3xl font-bold text-slate-900">{course.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-5 w-5 ${star <= 4 ? "fill-amber-400 text-amber-400" : "fill-muted stroke-muted-foreground"}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">(128 reviews)</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                      {courseInfo.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{courseInfo.students} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Updated {courseInfo.lastUpdated}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{courseInfo.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Certificate</span>
                    </div>
                  </div>

                  {isEnrolled && (
                    <div className="mb-6 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Your progress</span>
                        <span className="text-sm font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <div className="">
                    <ReadOnlyEditor initialContent= {course.description || "Learn the essential skills and concepts in this comprehensive course."}/>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs for Course Content, Reviews, FAQ */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
              {/* Course Content Section */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <Card className="shadow-lg border-0 bg-white py-6">
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
                                  onClick={() => handleContentClick(chapter.id, quiz.id, "quizze")}
                                >
                                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-600 rounded-full text-xs">
                                      Q{quizIndex + 1}
                                    </div>
                                    <HelpCircle className="h-4 w-4 text-amber-400" />
                                    <div className="flex-1">
                                      <h5 className="font-medium text-slate-700 group-hover:text-slate-900">
                                        {quiz.title}
                                      </h5>
                                    </div>
                                    {isEnrolled ? (
                                      isPassed ? (
                                        <Badge
                                          variant="outline"
                                          className="bg-green-50 text-green-700 hover:bg-green-50"
                                        >
                                          Passed
                                        </Badge>
                                      ) : (
                                        <Badge
                                          variant="outline"
                                          className="bg-amber-50 text-amber-700 hover:bg-amber-50"
                                        >
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
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="shadow-lg border-0 bg-white sticky top-20">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold mb-4">Free</div>

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
                          } else {
                            // All completed
                            setActiveTab("content")
                          }
                        }}
                      >
                        Continue Learning
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 transition-all duration-300"
                      onClick={() => {
                        // Enrollment logic would go here
                        window.location.reload()
                      }}
                    >
                      Enroll Now - It&apos;s Free
                    </Button>
                  )}

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

            {/* Attachments */}
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="shadow-lg border-0 bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-slate-900">Course Materials</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {attachments.map((attachment, index) => (
                      <Link href={attachment.url} target="_blank" key={index}>
                        <div className="flex items-center p-3 hover:bg-slate-50 rounded-md transition-colors">
                          <File className="h-4 w-4 mr-2 flex-shrink-0 text-slate-500" />
                          <p className="line-clamp-1 text-slate-700 hover:text-slate-900">{attachment.name}</p>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            
          </div>
        </div>
        <div>
          {/* Student Reviews Section */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Card className="shadow-lg border-0 bg-white overflow-hidden py-6 mt-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  Student Reviews
                </CardTitle>
                <CardDescription>See what our students are saying about this course</CardDescription>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${star <= 4 ? "fill-amber-400 text-amber-400" : "fill-muted stroke-muted-foreground"}`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-slate-900">4.8</span>
                  <span className="text-sm text-slate-500">(2,345 reviews)</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Marquee Reviews */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 py-8">
                  <div className="flex animate-marquee space-x-6 hover:pause-marquee">
                    {[...reviews, ...reviews, ...reviews].map((review, index) => (
                      <div
                        key={`${review.id}-${index}`}
                        className="flex-shrink-0 w-80 bg-white rounded-xl shadow-md p-6 border border-slate-100"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                              {review.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-slate-900">{review.name}</h4>
                              <span className="text-xs text-slate-500">{review.date}</span>
                            </div>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "fill-muted stroke-muted-foreground"}`}
                                />
                              ))}
                            </div>
                            <p className="text-slate-700 text-sm leading-relaxed line-clamp-3">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Reviews */}
                <div className="p-6 space-y-6 ">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Recent Reviews</h3>
                  {reviews.slice(0, 3).map((review) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-b border-slate-100 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                            {review.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900">{review.name}</h4>
                            <span className="text-xs text-slate-500">{review.date}</span>
                          </div>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "fill-muted stroke-muted-foreground"}`}
                              />
                            ))}
                          </div>
                          <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                          <div className="flex items-center gap-4 pt-2">
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                              👍 Helpful (12)
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="text-center pt-4">
                    <Button variant="outline" className="hover:bg-slate-50">
                      View All Reviews (2,345)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* FAQ Section */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <Card className="shadow-lg border-0 bg-white py-6 mt-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="h-6 w-6" />
                  Frequently Asked Questions
                </CardTitle>
                <CardDescription>Find answers to common questions about this course</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-slate-200">
                      <AccordionTrigger className="text-left font-medium text-slate-900 hover:text-slate-700 py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-700 pb-4 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                  <div className="text-center space-y-3">
                    <h3 className="text-lg font-semibold text-slate-900">Still have questions?</h3>
                    <p className="text-slate-600">
                      Can&apos;t find the answer you&apos;re looking for? Please chat with our friendly team.
                    </p>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Contact Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Enrollment Prompt Overlay */}
      {showEnrollPrompt && (
        <Dialog open={showEnrollPrompt} onOpenChange={setShowEnrollPrompt}>
          <DialogContent className="sm:max-w-md">
            <div className="p-6 text-center space-y-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Lock className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Enrollment Required</h3>
                <p className="text-slate-600">You need to enroll in this course to access the lessons and quizzes.</p>
              </div>
              <Button
                className="w-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700"
                onClick={() => {
                  setShowEnrollPrompt(false)
                  // Scroll to enrollment section
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }}
              >
                Enroll Now
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

const CoursePageSkeleton = () => {
  return (
    <div className="min-h-screen w-full max-w-7xl bg-slate-50">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
        <Loader text="Loading Course" />
      </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="aspect-video bg-slate-200 animate-pulse rounded-xl mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title Skeleton */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="h-8 bg-slate-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-slate-200 rounded animate-pulse" />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
                  <div className="h-4 bg-slate-200 rounded animate-pulse w-4/6" />
                </div>
              </CardContent>
            </Card>

            {/* Tabs Skeleton */}
            <div className="grid grid-cols-3 gap-2 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-200 rounded animate-pulse" />
              ))}
            </div>

            {/* Content Skeleton */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <div className="h-7 bg-slate-200 rounded animate-pulse w-1/3" />
                <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-slate-200 rounded animate-pulse w-2/3" />
                        <div className="h-3 bg-slate-200 rounded animate-pulse w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-6 space-y-4">
                <div className="h-6 bg-slate-200 rounded animate-pulse w-1/3" />
                <div className="h-10 bg-slate-200 rounded animate-pulse" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-slate-200 rounded-full animate-pulse" />
                      <div className="h-4 bg-slate-200 rounded animate-pulse flex-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded animate-pulse w-2/3" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-10 bg-slate-200 rounded animate-pulse" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursePage



// "use client"

// import { ChevronDown, ChevronRight, Play, FileText, ArrowRight, Lock } from "lucide-react"
// import Image from "next/image"
// import Link from "next/link"
// import { Dialog } from "@/components/ui/dialog"
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import type { Attachment, Chapter, Course, Lesson, Quiz } from "@prisma/client"
// import { useState, useEffect } from "react"
// //import { useAuth } from "@clerk/nextjs"
// import CourseEnrol from "./course-enrol"
// import LessonYouTubeVideo from "@/components/lightYouTubeVideo"
// import { ReadOnlyEditor } from "@/components/tiptap-templates/simple/readonly-editor"
// import { Loader } from "@/components/loader"

// interface CoursePageProps{
//     course: Course & {
//       chapters: (Chapter & {
//       lessons: Lesson[],
//       quizzes: Quiz[]
//     })[]
//     };
//     attachments: Attachment[];
// }

// const CoursePage = ({ course, attachments }: CoursePageProps) => {
//   const [isDialogOpen, setIsDialogOpen] = useState(false)
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     // Simulate loading time
//     const timer = setTimeout(() => {
//       setIsLoading(false)
//     }, 1500)

//     return () => clearTimeout(timer)
//   }, [])

//   const handleDialog = () => {
//     setIsDialogOpen(!isDialogOpen)
//   }

//   if (isLoading) {
//     return <CoursePageSkeleton />
//   }

//   return (
//     <>
//       {course.githubAccess === "pro" ? (
//         <FreeGithubAccess course={course} attachments={attachments} />
//       ) : course.githubAccess === "comment_unlock" ? (
//         <Dialog>
//           <FreeGithubAccess course={course} attachments={attachments} handleDialog={handleDialog} />
//         </Dialog>
//       ) : (
//         <FreeGithubAccess course={course} attachments={attachments} />
//       )}
//     </>
//   )
// }

// interface GithubAccessProps {
//   course: Course & {
//     chapters: (Chapter & {
//       lessons: Lesson[]
//     })[]
//   }
//   attachments: Attachment[]
//   handleDialog?: () => void
// }

// const FreeGithubAccess = ({ course, attachments, handleDialog }: GithubAccessProps) => {
//   //const { userId } = useAuth()
//   const userId = 'heool'
//   const [openChapters, setOpenChapters] = useState<string[]>([])
//   const [isEnrolled, setIsEnrolled] = useState(false) // This should come from your enrollment check
//   const [showEnrollPrompt, setShowEnrollPrompt] = useState(false)

//   const isChapters = course.chapters.length > 0

//   const toggleChapter = (chapterId: string) => {
//     setOpenChapters((prev) => (prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]))
//   }

//   const handleLessonClick = (lessonId: string) => {
//     if (!isEnrolled) {
//       setShowEnrollPrompt(true)
//       return
//     }
//     // Navigate to lesson
//     window.location.href = `/courses/${course.id}/lessons/${lessonId}`
//   }

//   return (
//     <div className=" ">
//       <div className=" mx-auto px-4 py-8 max-w-7xl">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Video/Image Section */}
//             <Card className="overflow-hidden shadow-xl border-0 bg-white">
//               <div className="relative">
//                 {course.courseVideoUrl ? (
//                   <div className="aspect-video">
//                     <LessonYouTubeVideo youTubeVideoUrl={course.courseVideoUrl} />
//                   </div>
//                 ) : (
//                   <div className="aspect-video relative">
//                     <Image
//                       fill
//                       className="object-cover"
//                       alt={course.title}
//                       src={course.imageUrl! || "/placeholder.svg"}
//                     />
//                   </div>
//                 )}
//               </div>
//             </Card>

//             {/* Course Description */}
//             {course.description && (
//               <Card className="shadow-lg border-0 bg-white py-6">
//                 <CardHeader className="pb-4">
//                   <CardTitle className="text-3xl font-bold text-slate-900 md:ml-4">{course.title}</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-6">
//                   <div>
//                     <h3 className="text-xl font-semibold text-slate-700 md:ml-4">Description</h3>
//                     <div className="prose prose-slate max-w-none text-slate-900">
//                       {/* <ReadOnlyEditor initialContent={course.description} /> */}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}

//             {/* Chapters Section */}
//             {isChapters && (
//               <Card className="shadow-lg border-0 bg-white py-6">
//                 <CardHeader>
//                   <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
//                     <FileText className="h-6 w-6" />
//                     Course Content
//                   </CardTitle>
//                   <p className="text-slate-600">
//                     {course.chapters.length} chapters •{" "}
//                     {course.chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0)} lessons
//                   </p>
//                 </CardHeader>
//                 <CardContent className="space-y-2">
//                   {course.chapters.map((chapter, chapterIndex) => (
//                     <Collapsible
//                       key={chapter.id}
//                       open={openChapters.includes(chapter.id)}
//                       onOpenChange={() => toggleChapter(chapter.id)}
//                     >
//                       <CollapsibleTrigger asChild>
//                         <Button
//                           variant="ghost"
//                           className="w-full justify-between p-4 h-auto hover:bg-slate-50 rounded-lg border border-slate-200"
//                         >
//                           <div className="flex items-center gap-3">
//                             <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm">
//                               {chapterIndex + 1}
//                             </div>
//                             <div className="text-left">
//                               <h4 className="font-semibold text-slate-900">{chapter.title}</h4>
//                               <p className="text-sm text-slate-500">{chapter.lessons.length} lessons</p>
//                             </div>
//                           </div>
//                           {openChapters.includes(chapter.id) ? (
//                             <ChevronDown className="h-5 w-5 text-slate-400" />
//                           ) : (
//                             <ChevronRight className="h-5 w-5 text-slate-400" />
//                           )}
//                         </Button>
//                       </CollapsibleTrigger>
//                       <CollapsibleContent className="px-4 pb-2">
//                         <div className="ml-11 space-y-2 border-l-2 border-slate-100 pl-4">
//                           {chapter.lessons.map((lesson, lessonIndex) => (
//                             <div
//                               key={lesson.id}
//                               className="relative group cursor-pointer"
//                               onClick={() => handleLessonClick(lesson.id)}
//                             >
//                               <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
//                                 <div className="flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-600 rounded-full text-xs">
//                                   {lessonIndex + 1}
//                                 </div>
//                                 <Play className="h-4 w-4 text-slate-400" />
//                                 <div className="flex-1">
//                                   <h5 className="font-medium text-slate-700 group-hover:text-slate-900">
//                                     {lesson.title}
//                                   </h5>
//                                   {/* {lesson.description && (
//                                     <p className="text-sm text-slate-500 line-clamp-1">{lesson.description}</p>
//                                   )} */}
//                                 </div>
//                                 {!isEnrolled && <Lock className="h-4 w-4 text-slate-400" />}
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </CollapsibleContent>
//                     </Collapsible>
//                   ))}
//                 </CardContent>
//               </Card>
//             )}
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Enrollment Card */}
//             {isChapters && (
//               <Card className="shadow-lg border-0 bg-white sticky top-20">
//                 <CardContent className="p-4">
//                   <CourseEnrol courseId={course.id} />
//                 </CardContent>
//               </Card>
//             )}

//           </div>
//         </div>
//       </div>
//       {/* Enrollment Prompt Overlay */}
//       {showEnrollPrompt && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <Card className="max-w-md w-full shadow-2xl border-0">
//             <CardContent className="p-8 text-center space-y-6">
//               <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
//                 <Lock className="h-8 w-8 text-blue-600" />
//               </div>
//               <div>
//                 <h3 className="text-xl font-bold text-slate-900 mb-2">Enrollment Required</h3>
//                 <p className="text-slate-600">You need to enroll in this course to access the lessons.</p>
//               </div>
//               <div className="flex items-center justify-center gap-2 text-blue-600">
//                 <ArrowRight className="h-5 w-5 animate-pulse" />
//                 <span className="font-medium">Scroll up to enroll</span>
//               </div>
//               <Button onClick={() => setShowEnrollPrompt(false)} variant="outline" className="w-full">
//                 Close
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }

// const CoursePageSkeleton = () => {
//   return (
//     <div className="min-h-screen w-full max-w-7xl ">
//       <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
//         <Loader text="Loading Course"/>
//       </div>
//       <div className="container mx-auto px-4 py-8 max-w-7xl">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Content Skeleton */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Video Skeleton */}
//             <Card className="overflow-hidden shadow-xl border-0 bg-white">
//               <div className="aspect-video bg-slate-200 animate-pulse" />
//             </Card>

//             {/* Description Skeleton */}
//             <Card className="shadow-lg border-0 bg-white">
//               <CardHeader className="pb-4">
//                 <div className="h-8 bg-slate-200 rounded animate-pulse w-3/4" />
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="h-6 bg-slate-200 rounded animate-pulse w-1/4" />
//                 <div className="space-y-2">
//                   <div className="h-4 bg-slate-200 rounded animate-pulse" />
//                   <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6" />
//                   <div className="h-4 bg-slate-200 rounded animate-pulse w-4/6" />
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Chapters Skeleton */}
//             <Card className="shadow-lg border-0 bg-white">
//               <CardHeader>
//                 <div className="h-7 bg-slate-200 rounded animate-pulse w-1/3" />
//                 <div className="h-4 bg-slate-200 rounded animate-pulse w-1/4" />
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {[1, 2, 3].map((i) => (
//                   <div key={i} className="p-4 border border-slate-200 rounded-lg">
//                     <div className="flex items-center gap-3">
//                       <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
//                       <div className="flex-1 space-y-2">
//                         <div className="h-5 bg-slate-200 rounded animate-pulse w-2/3" />
//                         <div className="h-3 bg-slate-200 rounded animate-pulse w-1/3" />
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar Skeleton */}
//           <div className="space-y-6">
//             {[1, 2, 3].map((i) => (
//               <Card key={i} className="shadow-lg border-0 bg-white">
//                 <CardContent className="p-6 space-y-4">
//                   <div className="h-6 bg-slate-200 rounded animate-pulse w-2/3" />
//                   <div className="h-4 bg-slate-200 rounded animate-pulse" />
//                   <div className="h-10 bg-slate-200 rounded animate-pulse" />
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default CoursePage