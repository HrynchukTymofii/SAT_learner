"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Check, ChevronDown, ListChecks, ListOrdered, Play, X } from "lucide-react"
import { cn } from "@/lib/utils"

type Outline = {
  id: string
  title: string
  chapters: {
    id: string
    title: string
    lessons: { id: string; title: string; position: number; progress: { completed: boolean }[] }[]
    quizzes: { id: string; title: string; position: number; maxScore: number | null; results: { score: number }[] }[]
  }[]
}

type Item = { id: string; title: string; type: "lessons" | "quizzes"; position: number; done: boolean; score: number | null }

// Lessons and quizzes of a chapter in course order, with what the student finished
function chapterItems(chapter: Outline["chapters"][number]): Item[] {
  return [
    ...chapter.lessons.map((l) => ({ id: l.id, title: l.title, type: "lessons" as const, position: l.position, done: !!l.progress[0]?.completed, score: null })),
    ...chapter.quizzes.map((q) => {
      const result = q.results[0]
      return {
        id: q.id,
        title: q.title,
        type: "quizzes" as const,
        position: q.position,
        done: !!result,
        score: result ? Math.round((result.score / (q.maxScore || 100)) * 100) : null,
      }
    }),
  ].sort((a, b) => a.position - b.position)
}

// The course outline: a right sidebar on wide screens, a drawer from the right on smaller ones
const ChapterSidebar = ({ course }: { course: Outline }) => {
  const pathname = usePathname()
  // Works for /course/… and the internal /learn/course/…
  const [, currentChapterId, , currentItemId] = pathname.match(/\/course\/([^/]+)\/(lessons|quizzes)\/([^/]+)/) ?? []

  const chapters = course.chapters.map((chapter) => ({ ...chapter, items: chapterItems(chapter) }))
  const total = chapters.reduce((n, c) => n + c.items.length, 0)
  const done = chapters.reduce((n, c) => n + c.items.filter((i) => i.done).length, 0)
  const percent = total ? Math.round((done / total) * 100) : 0

  const [open, setOpen] = useState<string[]>(currentChapterId ? [currentChapterId] : [])
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Moving to another chapter opens it in the outline; the drawer closes on every navigation
  useEffect(() => {
    if (currentChapterId) setOpen((prev) => (prev.includes(currentChapterId) ? prev : [...prev, currentChapterId]))
    setDrawerOpen(false)
  }, [pathname, currentChapterId])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false)
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [drawerOpen])

  const toggle = (id: string) => setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const outline = (
    <div className="flex max-h-full min-h-0 flex-col">
      <div className="grid gap-3 border-b p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/courses/${course.id}`} className="font-display text-lg font-semibold leading-snug hover:underline">
            {course.title}
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary xl:hidden"
            aria-label="Close outline"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-lav-2 transition-[width]" style={{ width: `${percent}%` }} />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">
          {done} of {total} done · {percent}%
        </p>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Course outline">
        {chapters.map((chapter, index) => {
          const isOpen = open.includes(chapter.id)
          const chapterDone = chapter.items.filter((i) => i.done).length
          const complete = chapter.items.length > 0 && chapterDone === chapter.items.length
          return (
            <section key={chapter.id}>
              <button
                type="button"
                onClick={() => toggle(chapter.id)}
                aria-expanded={isOpen}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-accent",
                  chapter.id === currentChapterId && "font-bold"
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-xs font-extrabold",
                    complete ? "bg-mint text-on-pastel" : "bg-secondary text-muted-foreground"
                  )}
                >
                  {complete ? <Check className="size-3.5" /> : index + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">{chapter.title}</span>
                <span className="text-xs font-bold tabular-nums text-muted-foreground">
                  {chapterDone}/{chapter.items.length}
                </span>
                <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              </button>

              {isOpen && (
                <ul className="mb-2 ml-[26px] border-l-[1.5px] pl-2">
                  {chapter.items.map((item) => {
                    const current = item.id === currentItemId
                    const Icon = item.type === "lessons" ? Play : ListChecks
                    return (
                      <li key={`${item.type}-${item.id}`}>
                        <Link
                          href={`/course/${chapter.id}/${item.type}/${item.id}`}
                          aria-current={current ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors",
                            current ? "bg-lav font-bold text-on-pastel" : "hover:bg-accent"
                          )}
                        >
                          <Icon className={cn("size-3.5 shrink-0", !current && "text-muted-foreground", item.type === "lessons" && "fill-current")} />
                          <span className="min-w-0 flex-1 truncate">{item.title}</span>
                          {item.score !== null ? (
                            <span className="text-xs font-extrabold tabular-nums">{item.score}%</span>
                          ) : (
                            item.done && <Check className="size-4 shrink-0 text-success" />
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )
        })}
      </nav>
    </div>
  )

  return (
    <>
      {/* Wide screens: docked to the panel's right edge under the profile bar, sticks while the lesson scrolls */}
      <aside className="absolute inset-y-0 right-0 hidden w-[320px] xl:block">
        <div className="sticky top-3 flex max-h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-l-[28px] border border-r-0 bg-card">
          {outline}
        </div>
      </aside>

      {/* Smaller screens: a pill above the tab bar opens the outline as a drawer */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-28 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-bold text-background shadow-lg md:bottom-6 md:right-6 xl:hidden"
      >
        <ListOrdered className="size-4" /> Lessons · {percent}%
      </button>
      {drawerOpen && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Course outline">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-2 right-2 flex w-[min(360px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[28px] bg-card shadow-2xl">
            {outline}
          </div>
        </div>
      )}
    </>
  )
}

export default ChapterSidebar
