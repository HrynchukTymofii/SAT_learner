import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ChapterEditor } from "./chapter-editor"

export const dynamic = "force-dynamic"

export default async function AdminChapterPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params
  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    select: {
      id: true,
      title: true,
      description: true,
      isPublished: true,
      isFree: true,
      lessons: { select: { id: true, title: true, position: true, isPublished: true, isFree: true, videoUrl: true, youTubeVideoUrl: true } },
      quizzes: { select: { id: true, title: true, position: true, isPublished: true, isFree: true, totalQuestions: true } },
    },
  })
  if (!chapter) notFound()

  // Lessons and quizzes share one order inside a chapter
  const items = [
    ...chapter.lessons.map((l) => ({
      id: l.id,
      type: "lesson" as const,
      title: l.title,
      position: l.position,
      isPublished: l.isPublished,
      isFree: l.isFree,
      detail: l.videoUrl || l.youTubeVideoUrl ? "Video lesson" : "Lesson",
    })),
    ...chapter.quizzes.map((q) => ({
      id: q.id,
      type: "quiz" as const,
      title: q.title,
      position: q.position,
      isPublished: q.isPublished,
      isFree: q.isFree,
      detail: `Quiz · ${q.totalQuestions} question${q.totalQuestions === 1 ? "" : "s"}`,
    })),
  ].sort((a, b) => a.position - b.position)

  return (
    <ChapterEditor
      chapter={{ id: chapter.id, title: chapter.title, description: chapter.description ?? "", isPublished: chapter.isPublished, isFree: chapter.isFree }}
      items={items}
    />
  )
}
