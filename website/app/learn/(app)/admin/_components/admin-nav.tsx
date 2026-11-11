"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Bell, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/admin", label: "Course", icon: BookOpen, match: (p: string) => !p.includes("/admin/notifications") },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, match: (p: string) => p.includes("/admin/notifications") },
]

export function AdminNav({ name }: { name: string }) {
  const pathname = usePathname() || ""
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav className="bg-muted flex gap-1 rounded-full p-1">
        {TABS.map(({ href, label, icon: Icon, match }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              match(pathname) ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" /> {label}
          </Link>
        ))}
      </nav>
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
        <ShieldCheck className="size-4" /> Admin · {name}
      </span>
    </div>
  )
}
