"use client"

import type { Chapter, Course, Lesson, Quiz } from "@prisma/client"
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Menu,
  PlayCircle,
  X,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { buildStyles, CircularProgressbar } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ChapterSidebarProps {
  course: Course & {
    chapters: Array<
      Chapter & {
        lessons: Array<
          Lesson & {
            progress: Array<{ completed: boolean }>
          }
        >
        quizzes: Array<
          Quiz & {
            results: Array<{ score: number }>
          }
        >
      }
    >
  }
  currentChapterId?: string
  currentItemId?: string
  currentItemType?: "lesson" | "quiz" | "challenge"
}

const ChapterSidebar = ({ course, currentChapterId, currentItemId, currentItemType }: ChapterSidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openChapters, setOpenChapters] = useState<string[]>([])

  // Calculate progress statistics
  const totalLessons = course.chapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0)
  const totalQuizzes = course.chapters.reduce((sum, chapter) => sum + chapter.quizzes.length, 0)
 

  const totalItems = totalLessons + totalQuizzes

  const completedLessons = course.chapters.reduce(
    (sum, chapter) =>
      sum + chapter.lessons.filter((lesson) => lesson.progress.length > 0 && lesson.progress[0].completed).length,
    0,
  )

  const completedQuizzes = course.chapters.reduce(
    (sum, chapter) => sum + chapter.quizzes.filter((quiz) => quiz.results.length > 0).length,
    0,
  )

  const completedItems = completedLessons + completedQuizzes
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  // Open current chapter by default
  useEffect(() => {
    if (currentChapterId && !openChapters.includes(currentChapterId)) {
      setOpenChapters((prev) => [...prev, currentChapterId])
    }
  }, [currentChapterId, openChapters])

  // Handle chapter toggle
  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => (prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]))
  }

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("course-sidebar")
      const toggleButton = document.getElementById("sidebar-toggle")

      if (
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        toggleButton &&
        !toggleButton.contains(event.target as Node) &&
        isMobileOpen
      ) {
        setIsMobileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobileOpen])

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMobileOpen])

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        id="sidebar-toggle"
        variant="outline"
        size="icon"
        className="fixed bottom-12 left-6 z-50 rounded-full shadow-lg md:hidden bg-lav border-0 text-on-pastel"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

      {/* Sidebar */}
     
        <div
          id="course-sidebar"
          className={cn(
            "md:flex fixed inset-y-0 left-0 z-50 min-w-80 w-80 bg-white shadow-xl flex-col rounded-3xl ",
            "md:relative md:shadow-none md:translate-x-0 md:z-0",
            isMobileOpen ? "flex" : "hidden",
          )}
        >
           {/* Course Header */}
          <div className="p-4 border-b border-border">
            <Link
              href={`/course`}
              className="flex items-center gap-4 p-3 rounded-lg transition hover:bg-muted"
              onClick={() => setIsMobileOpen(false)}
            >
              <div className="w-14 h-14 shrink-0">
                <CircularProgressbar
                  value={completionPercentage}
                  text={`${completionPercentage}%`}
                  styles={buildStyles({
                    pathColor: "#8b5cf6",
                    trailColor: "#e2e8f0",
                    textColor: "#8b5cf6",
                    textSize: "28px",
                    backgroundColor: "#ffffff",
                  })}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-foreground dark:text-white truncate">{course.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={completionPercentage} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {completedItems}/{totalItems} completed
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Chapters List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {course.chapters.map((chapter, chapterIndex) => {
              // Combine and sort all items in the chapter
              const combinedItems = [
                ...chapter.lessons.map((lesson) => ({
                  id: lesson.id,
                  title: lesson.title,
                  isFree: lesson.isFree || false,
                  type: "lesson" as const,
                  position: lesson.position || 0,
                  completed: lesson.progress.length > 0 && lesson.progress[0].completed ? 1 : 0,
                })),
                ...chapter.quizzes.map((quiz) => ({
                  id: quiz.id,
                  title: quiz.title,
                  isFree: quiz.isFree || false,
                  type: "quizze" as const,
                  position: quiz.position || 0,
                  completed: quiz.results.length > 0 ? (quiz.results[0].score / (quiz.maxScore || 100)) * 100 : -1,
                }))
              ].sort((a, b) => a.position - b.position)

              // Calculate chapter completion
              const totalChapterItems = combinedItems.length
              const completedChapterItems = combinedItems.filter(
                (item) =>
                  (item.type === "lesson" && item.completed === 1) || (item.type === "quizze" && item.completed >= 0),
              ).length

              const chapterCompletionPercentage =
                totalChapterItems > 0 ? Math.round((completedChapterItems / totalChapterItems) * 100) : 0

              const isChapterOpen = openChapters.includes(chapter.id)
              const isCurrentChapter = chapter.id === currentChapterId

              return (
                <Collapsible
                  key={chapter.id}
                  open={isChapterOpen}
                  onOpenChange={() => toggleChapter(chapter.id)}
                  className={cn(
                    "rounded-lg overflow-hidden border",
                    isCurrentChapter
                      ? "border-transparent shadow-md"
                      : "border-border",
                  )}
                >
                  <CollapsibleTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center justify-between p-3 cursor-pointer",
                        isCurrentChapter ? "bg-lav-2" : "bg-white",
                        "hover:bg-muted transition-colors",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                            chapterCompletionPercentage === 100
                              ? "bg-mint text-foreground"
                              : "bg-muted text-foreground",
                          )}
                        >
                          {chapterCompletionPercentage === 100 ? <CheckCircle className="h-4 w-4" /> : chapterIndex + 1}
                        </div>
                        <h3 className="font-medium text-foreground dark:text-white">{chapter.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {totalChapterItems > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {completedChapterItems}/{totalChapterItems}
                          </span>
                        )}
                        {isChapterOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-muted">
                    <div className="p-2 space-y-1.5">
                      {combinedItems.map((item) => {
                        const isCurrentItem = currentItemId === item.id && currentItemType === item.type

                        // Determine icon and styling based on item type
                        let ItemIcon = PlayCircle
                        let itemBg = "bg-white"
                        let itemHoverBg = "hover:bg-muted"
                        let statusElement = null

                        if (item.type === "lesson") {
                          ItemIcon = FileText
                          if (item.completed === 1) {
                            statusElement = <CheckCircle className="h-4 w-4 text-success shrink-0" />
                          }
                        } else if (item.type === "quizze") {
                          ItemIcon = HelpCircle
                          itemBg = "bg-lav"
                          itemHoverBg = "hover:bg-lav"

                          if (item.completed >= 0) {
                            statusElement = (
                              <Badge
                                variant="outline"
                                className="bg-lav text-foreground text-xs"
                              >
                                {Math.round(item.completed)}%
                              </Badge>
                            )
                          }
                        }

                        return (
                          <Link
                            key={`${item.type}-${item.id}`}
                            href={`/course/${chapter.id}/${item.type}s/${item.id}`}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-md transition-all",
                              itemBg,
                              itemHoverBg,
                              isCurrentItem && "ring-2 ring-lav-2",
                              "group",
                            )}
                            onClick={() => setIsMobileOpen(false)}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={cn(
                                  "flex items-center justify-center w-6 h-6 rounded-full text-xs",
                                  item.type === "lesson"
                                    ? "bg-muted text-foreground"
                                    : item.type === "quizze"
                                      ? "bg-lav text-foreground"
                                      : "bg-butter text-foreground",
                                )}
                              >
                                <ItemIcon className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-sm text-foreground truncate">{item.title}</span>
                            </div>
                            {statusElement}
                          </Link>
                        )
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>

          {/* Mobile Close Button */}
          <div className="p-4 border-t border-border md:hidden">
            <Button variant="outline" className="w-full" onClick={() => setIsMobileOpen(false)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Close Navigation
            </Button>
          </div>
         
        </div>
    </>
  )
}

export default ChapterSidebar
