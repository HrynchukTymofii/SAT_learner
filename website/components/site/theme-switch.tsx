"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

const OPTIONS = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "system", label: "System theme", icon: Monitor },
]

// Light / dark / system. `onFrame` styles it for the black frame (header, sidebar)
export function ThemeSwitch({ onFrame = false, className }: { onFrame?: boolean; className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        "flex rounded-full p-[3px]",
        onFrame ? "bg-frame-line" : "border bg-card",
        className
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = mounted && theme === value
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => setTheme(value)}
            className={cn(
              "grid size-8 place-items-center rounded-full transition-colors",
              active
                ? onFrame
                  ? "bg-white text-on-pastel"
                  : "bg-foreground text-background"
                : onFrame
                  ? "text-frame-muted hover:text-frame-foreground"
                  : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}
