"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { createChapter, reorderChapters } from "../actions"
import { act, AddForm, Panel, SortableList, StatusBadge } from "./ui"

type Chapter = { id: string; title: string; isPublished: boolean; free: number; lessons: number; quizzes: number }

export function CourseTree({ courseId, title, chapters }: { courseId: string; title: string; chapters: Chapter[] }) {
  const router = useRouter()
  const published = chapters.filter((c) => c.isPublished).length

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {chapters.length} chapters, {published} published. Drag to change the order; students see it right away.
        </p>
      </div>

      <Panel>
        {chapters.length ? (
          <SortableList
            items={chapters}
            onReorder={(list) => act(reorderChapters(courseId, list.map((c) => c.id)), "Order saved")}
            render={(ch, i) => (
              <Link href={`/admin/chapters/${ch.id}`} className="flex min-w-0 flex-1 items-center gap-3 py-3">
                <span className="text-muted-foreground w-6 shrink-0 text-right text-xs font-bold tabular-nums">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{ch.title}</span>
                  <span className="text-muted-foreground text-xs">
                    {ch.lessons} lesson{ch.lessons === 1 ? "" : "s"} · {ch.quizzes} quiz{ch.quizzes === 1 ? "" : "zes"}
                    {ch.free > 0 && ` · ${ch.free === ch.lessons + ch.quizzes ? "all" : ch.free} free`}
                  </span>
                </span>
                <StatusBadge published={ch.isPublished} />
                <ChevronRight className="text-muted-foreground size-4 shrink-0" />
              </Link>
            )}
          />
        ) : (
          <p className="text-muted-foreground text-sm">No chapters yet.</p>
        )}
        <AddForm
          placeholder="New chapter title"
          button="Add chapter"
          onAdd={async (t) => {
            const id = await act(createChapter(courseId, t))
            if (id) router.push(`/admin/chapters/${id}`)
            return id
          }}
        />
      </Panel>
    </div>
  )
}
