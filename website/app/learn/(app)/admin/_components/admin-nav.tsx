"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Bell, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { AdminViewToggle } from "@/components/platform/admin-view-toggle"

const TABS = [
  { href: "/admin", label: "Course", icon: BookOpen, match: (p: string) => !p.includes("/admin/notifications") },
  { href: "/admin/notifications", label: "Notifications", icon: Bell, match: (p: string) => p.includes("/admin/notifications") },
]

export function AdminNav({ name }: { name: string }) {
  const pathname = usePathname() || ""
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <nav className="bg-muted flex gap-1 rounded-full p-1">
        {TABS.map(({ href, label, icon: Icon, match }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:flex-none",
              match(pathname) ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" /> {label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <AdminViewToggle className="w-full sm:w-auto sm:min-w-[220px]" />
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold">
          <ShieldCheck className="size-4" /> Admin · {name}
        </span>
      </div>
    </div>
  )
}
