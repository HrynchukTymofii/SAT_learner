import { cn } from "@/lib/utils"

// Loading placeholders for platform pages, shaped like the pages they stand in for

function Bar({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-full bg-foreground/10", className)} />
}

// Home, practice, planner, stats, profile: title, a pastel banner, then a grid of tiles
export function PageSkeleton({ tiles = 4, label = "Loading" }: { tiles?: number; label?: string }) {
  return (
    <div className="grid w-full max-w-6xl gap-8" role="status" aria-label={label}>
      <Bar className="h-10 w-56" />
      <div className="paper grid min-h-[200px] content-center gap-4 rounded-[32px] bg-lav p-7 sm:p-8">
        <Bar className="h-3 w-32 bg-on-pastel/15" />
        <Bar className="h-9 w-2/3 max-w-md bg-on-pastel/15" />
        <Bar className="h-12 w-44 bg-on-pastel/20" />
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: tiles }, (_, i) => (
          <div key={i} className="grid gap-8 rounded-[28px] border bg-card p-5">
            <div className="size-12 animate-pulse rounded-2xl bg-secondary" />
            <div className="grid gap-2">
              <Bar className="h-4 w-3/4" />
              <Bar className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-3.5 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-4 rounded-[28px] border bg-card p-5">
            <div className="size-14 shrink-0 animate-pulse rounded-2xl bg-secondary" />
            <div className="grid flex-1 gap-2">
              <Bar className="h-4 w-2/3" />
              <Bar className="h-2 w-full" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">{label}…</span>
    </div>
  )
}

// Quiz, exam, lesson: header with the question numbers, the question card and its options
export function QuestionSkeleton({ label = "Loading questions" }: { label?: string }) {
  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6" role="status" aria-label={label}>
      <div className="flex items-center justify-between gap-4">
        <Bar className="h-8 w-48" />
        <Bar className="h-10 w-28" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className={cn("size-10 shrink-0 animate-pulse rounded-full", i === 0 ? "bg-lav" : "bg-secondary")} />
        ))}
      </div>
      <div className="grid gap-5 rounded-[32px] border bg-card p-6 sm:p-8">
        <Bar className="h-3 w-24" />
        <Bar className="h-5 w-full" />
        <Bar className="h-5 w-4/5" />
        <div className="mt-3 grid gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex h-14 items-center gap-3 rounded-full border-[1.5px] px-3">
              <div className="size-8 animate-pulse rounded-full bg-secondary" />
              <Bar className="h-3.5 w-1/2" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">{label}…</span>
    </div>
  )
}
