import Link from "next/link"
import { ArrowRight, Bookmark, CheckCircle2, Clock, ListChecks, Play, RotateCcw, ShieldCheck } from "lucide-react"
import type { CourseWithProgress } from "@/lib/course-progress"
import { SystemDoodle } from "@/components/site/doodles"
import { cn } from "@/lib/utils"

const PRACTICE = [
  { href: "/tests", label: "Topic tests", hint: "Practice one skill", icon: ListChecks, bg: "bg-lav" },
  { href: "/tests/exam", label: "Full exam", hint: "On the real clock", icon: Clock, bg: "bg-butter" },
  { href: "/tests/wrong", label: "Wrong answers", hint: "Redo what you missed", icon: RotateCcw, bg: "bg-rose" },
  { href: "/tests/saved", label: "Saved", hint: "Questions you bookmarked", icon: Bookmark, bg: "bg-mint" },
]
const PASTELS = ["bg-lav", "bg-butter", "bg-mint"]

// Platform home: continue banner, every course with its progress, then practice modes
export function PlatformHome({ firstName, courses, isAdmin = false }: { firstName?: string; courses: CourseWithProgress[]; isAdmin?: boolean }) {
  const current = courses.find((c) => c.next) ?? null

  return (
    <div className="grid w-full max-w-6xl gap-8">
      <h1 className="text-[32px] font-semibold leading-tight sm:text-[40px]">{firstName ? `Hi, ${firstName}` : "Welcome back"}</h1>

      {/* Admins only: black, unlike the pastel learner cards, so it never reads as course content */}
      {isAdmin && (
        <Link
          href="/admin"
          className="group flex flex-wrap items-center gap-5 rounded-[32px] bg-frame p-6 text-frame-foreground ring-1 ring-transparent transition-transform dark:ring-frame-line hover:-translate-y-0.5 sm:p-7"
        >
          <span className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-brand text-white dark:text-black">
            <ShieldCheck className="size-7" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11.5px] font-extrabold uppercase tracking-[.12em] text-frame-muted">Admin</span>
            <span className="block text-[24px] font-semibold leading-tight sm:text-[28px]">Go to the admin dashboard</span>
            <span className="block text-sm font-semibold text-frame-muted">Edit chapters, lessons, quizzes and questions. Upload images and videos.</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-black">
            Open admin <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}

      {current?.next ? (
        <section className="paper relative grid min-h-[230px] content-center gap-3.5 overflow-hidden rounded-[32px] bg-lav p-7 sm:p-8">
          <p className="text-[11.5px] font-extrabold uppercase tracking-[.12em]">
            {current.done ? "Continue where you stopped" : "Start here"}
          </p>
          <h2 className="max-w-[18ch] text-[28px] font-semibold leading-[1.1] sm:text-[38px]">{current.next.title}</h2>
          <div className="relative z-10 flex flex-wrap items-center gap-3.5">
            <Link href={current.next.url} className="inline-flex items-center gap-3 rounded-full bg-on-pastel py-1.5 pl-5 pr-1.5 font-bold text-white">
              {current.done ? "Resume" : "Start"} {current.next.type}
              <span className="grid size-9 place-items-center rounded-full bg-white text-on-pastel">
                <Play className="size-4 fill-current" />
              </span>
            </Link>
            <span className="text-sm font-bold">{current.next.chapterTitle}</span>
          </div>
          <SystemDoodle className="pointer-events-none absolute right-4 top-1/2 hidden h-[200px] w-[300px] -translate-y-1/2 opacity-90 lg:block" />
        </section>
      ) : (
        courses.length > 0 && (
          <section className="paper flex items-center gap-4 rounded-[32px] bg-mint p-7">
            <CheckCircle2 className="size-8 shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold">You finished every course</h2>
              <p className="font-semibold">Open any lesson to review it, or take a full exam.</p>
            </div>
          </section>
        )
      )}

      <section className="grid gap-3.5">
        <h2 className="text-[23px] font-semibold">Your courses</h2>
        {courses.length ? (
          <div className="grid gap-3.5 lg:grid-cols-2">
            {courses.map((course, i) => (
              <CourseCard key={course.id} course={course} color={PASTELS[i % 3]} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No courses yet.</p>
        )}
      </section>

      <section className="grid gap-3.5">
        <h2 className="text-[23px] font-semibold">Practice</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PRACTICE.map(({ href, label, hint, icon: Icon, bg }) => (
            <Link key={href} href={href} className="group grid gap-6 rounded-[24px] border bg-card p-4 transition-colors hover:border-lav-2">
              <span className={cn("grid size-11 place-items-center rounded-2xl", bg)}>
                <Icon className="size-5" />
              </span>
              <span>
                <span className="flex items-center justify-between font-bold">
                  {label}
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="text-[13px] font-semibold text-muted-foreground">{hint}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

function CourseCard({ course, color }: { course: CourseWithProgress; color: string }) {
  const percent = course.total ? Math.round((course.done / course.total) * 100) : 0
  return (
    <div className="grid gap-4 rounded-[28px] border bg-card p-5">
      <div className="flex items-start gap-4">
        <span className={cn("paper grid size-14 shrink-0 place-items-center rounded-[18px] font-display text-lg font-bold", color)}>{percent}%</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold leading-snug">{course.title}</h3>
          <p className="text-sm font-semibold text-muted-foreground">
            {course.done} of {course.total} lessons and quizzes done
          </p>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground" style={{ width: `${percent}%` }} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/courses/${course.id}`} className="text-sm font-bold text-brand hover:underline">
          All chapters
        </Link>
        {course.next && (
          <Link href={course.next.url} className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background">
            {course.done ? "Continue" : "Start"} <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
