"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Admins only: see the platform as PRO (default) or as a free student.
 * Stored in the login session (lib/auth.ts, previewFree), so it applies to every page right away.
 */
export function AdminViewToggle({ onFrame = false, className }: { onFrame?: boolean; className?: string }) {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [pending, setPending] = useState<"pro" | "free" | null>(null)
  if (!session?.user?.isAdmin) return null

  const current = session.user.previewFree ? "free" : "pro"
  const choose = async (mode: "pro" | "free") => {
    if (mode === current || pending) return
    setPending(mode)
    try {
      await update({ previewFree: mode === "free" })
      router.refresh()
    } finally {
      setPending(null)
    }
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      <span className={cn("text-[11px] font-extrabold uppercase tracking-[.12em]", onFrame ? "text-frame-muted" : "text-muted-foreground")}>
        View as
      </span>
      <div className={cn("flex gap-1 rounded-full p-1", onFrame ? "bg-frame-line" : "bg-muted")} role="radiogroup" aria-label="View the platform as">
        {(["pro", "free"] as const).map((mode) => {
          const active = (pending ?? current) === mode
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={!!pending}
              onClick={() => choose(mode)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : onFrame
                    ? "text-frame-muted hover:text-frame-foreground"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {pending === mode && <Loader2 className="size-3.5 animate-spin" />}
              {mode === "pro" ? "PRO" : "Free student"}
            </button>
          )
        })}
      </div>
    </div>
  )
}
