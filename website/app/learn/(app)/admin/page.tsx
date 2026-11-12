import { db } from "@/lib/db"
import { platformCourseIds } from "@/lib/course-progress"
import { CourseTree } from "./_components/course-tree"

export const dynamic = "force-dynamic"

// /admin: the platform courses and their chapters
export default async function AdminCoursePage() {
  const ids = platformCourseIds()
  const courses = await db.course.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      chapters: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          isPublished: true,
          _count: { select: { lessons: true, quizzes: true } },
          lessons: { where: { isFree: true }, select: { id: true } },
          quizzes: { where: { isFree: true }, select: { id: true } },
        },
      },
    },
  })
  courses.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))

  if (!courses.length) {
    return <p className="text-muted-foreground">No course found. Set COURSE_ID (or PLATFORM_COURSE_IDS) in the environment.</p>
  }

  return (
    <div className="space-y-6">
      {courses.map((c) => (
        <CourseTree
          key={c.id}
          courseId={c.id}
          title={c.title}
          chapters={c.chapters.map((ch) => ({
            id: ch.id,
            title: ch.title,
            isPublished: ch.isPublished,
            free: ch.lessons.length + ch.quizzes.length,
            lessons: ch._count.lessons,
            quizzes: ch._count.quizzes,
          }))}
        />
      ))}
    </div>
  )
}
