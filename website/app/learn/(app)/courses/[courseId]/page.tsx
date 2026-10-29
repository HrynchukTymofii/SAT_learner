import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { CheckCircle2, Circle, FileQuestion, PlayCircle } from "lucide-react"
import { auth } from "@/lib/getAuth"
import { getCoursesWithProgress, platformCourseIds } from "@/lib/course-progress"
import { CourseProgressCard } from "@/components/platform/course-progress-card"

// One course: progress, the next item, and every chapter with its lessons and quizzes in order
export default async function CourseOverviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  if (!platformCourseIds().includes(courseId)) notFound()

  const { userId } = await auth()
  if (!userId) redirect("/login")
  const [course] = await getCoursesWithProgress(userId, [courseId])
  if (!course) notFound()

  return (
    <div className="w-full max-w-4xl space-y-6">
      <CourseProgressCard course={course} showOverviewLink={false} />

      <div className="space-y-4">
        {course.chapters.map((chapter, i) => {
          const done = chapter.items.filter((item) => item.done).length
          return (
            <section key={chapter.id} className="rounded-xl border bg-background">
              <header className="flex items-center justify-between gap-4 px-5 py-4 border-b">
                <h2 className="font-semibold">
                  <span className="text-muted-foreground mr-2">{i + 1}.</span>
                  {chapter.title}
                </h2>
                <span className="text-sm text-muted-foreground tabular-nums shrink-0">
                  {done}/{chapter.items.length}
                </span>
              </header>
              <ul>
                {chapter.items.map((item) => {
                  const Icon = item.type === "lesson" ? PlayCircle : FileQuestion
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 min-w-0 truncate">{item.title}</span>
                        {item.done ? (
                          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
