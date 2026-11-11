import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { LessonEditor } from "./lesson-editor"

export const dynamic = "force-dynamic"

export default async function AdminLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      content: true,
      videoUrl: true,
      youTubeVideoUrl: true,
      points: true,
      isPublished: true,
      isFree: true,
      chapter: { select: { id: true, title: true } },
    },
  })
  if (!lesson) notFound()

  return (
    <LessonEditor
      lesson={{
        id: lesson.id,
        title: lesson.title,
        content: lesson.content ?? "",
        videoUrl: lesson.videoUrl ?? "",
        youTubeVideoUrl: lesson.youTubeVideoUrl ?? "",
        points: lesson.points,
        isPublished: lesson.isPublished,
        isFree: lesson.isFree,
      }}
      chapter={lesson.chapter}
    />
  )
}
