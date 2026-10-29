import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { CourseWithProgress } from "@/lib/course-progress"

// One course: progress and the next lesson or quiz to open
export function CourseProgressCard({ course, showOverviewLink = true }: { course: CourseWithProgress; showOverviewLink?: boolean }) {
  const percent = course.total ? Math.round((course.done / course.total) * 100) : 0

  return (
    <div className="rounded-xl border bg-background p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{course.title}</h2>
          <p className="text-sm text-muted-foreground">
            {course.done} of {course.total} lessons and quizzes done
          </p>
        </div>
        <span className="text-sm font-semibold tabular-nums">{percent}%</span>
      </div>
      <Progress value={percent} className="h-2" />

      {course.next ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 text-sm">
            <p className="text-muted-foreground">Next · {course.next.chapterTitle}</p>
            <p className="font-medium truncate">{course.next.title}</p>
          </div>
          <Button asChild className="shrink-0">
            <Link href={course.next.url}>
              {course.done ? "Continue" : "Start"} <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm font-medium text-success">
          <CheckCircle2 className="h-4 w-4" /> Course completed. Open any lesson to review it.
        </p>
      )}

      {showOverviewLink && (
        <Link href={`/courses/${course.id}`} className="inline-block text-sm text-primary hover:underline">
          All chapters
        </Link>
      )}
    </div>
  )
}
