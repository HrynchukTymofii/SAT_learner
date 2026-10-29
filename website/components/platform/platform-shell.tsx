"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SessionProvider, signOut } from "next-auth/react"
import { BarChart2, Bookmark, Calendar, ExternalLink, Home, ListChecks, LogOut, RotateCcw, User } from "lucide-react"
import ToasterProvider from "@/components/toaster-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brand } from "@/components/site/brand"
import { ThemeSwitch } from "@/components/site/theme-switch"
import { APP_STORE_URL } from "@/lib/site"
import { cn } from "@/lib/utils"
import { siteUrl } from "@/lib/urls"

const SECTIONS = [
  {
    title: "Learn",
    items: [
      { href: "/", label: "Home", icon: Home, mobile: true },
      { href: "/tests", label: "Practice", icon: ListChecks, mobile: true },
      { href: "/planner", label: "Planner", icon: Calendar, mobile: true },
    ],
  },
  {
    title: "Review",
    items: [
      { href: "/dashboard", label: "Stats", icon: BarChart2, mobile: true },
      { href: "/tests/wrong", label: "Wrong answers", icon: RotateCcw },
      { href: "/tests/saved", label: "Saved", icon: Bookmark },
    ],
  },
  {
    title: "Account",
    items: [{ href: "/profile", label: "Profile", icon: User, mobile: true }],
  },
]
const ITEMS = SECTIONS.flatMap((s) => s.items)

// The most specific nav item for the path: /tests/wrong is "Wrong answers", not "Practice".
// Course, lesson and quiz pages belong to Home.
function activeHref(pathname: string) {
  const path = pathname.replace(/^\/learn(?=\/|$)/, "") || "/"
  if (path === "/" || path.startsWith("/course")) return "/"
  return ITEMS.map((i) => i.href)
    .filter((href) => href !== "/" && (path === href || path.startsWith(`${href}/`)))
    .sort((a, b) => b.length - a.length)[0]
}

interface PlatformShellProps {
  user: { name: string | null; image: string | null; isPro: boolean }
  children: React.ReactNode
}

// Learning platform layout: black sidebar whose active item cuts into the page on desktop,
// a floating tab bar on phones
export function PlatformShell({ user, children }: PlatformShellProps) {
  const active = activeHref(usePathname())

  return (
    <SessionProvider>
      <ToasterProvider />
      <div className="min-h-screen bg-frame md:grid md:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto py-6 pl-5 text-frame-foreground md:flex">
          <Brand className="mb-6 px-1.5" />
          {SECTIONS.map((section) => (
            <div key={section.title} className="mb-2">
              <p className="px-3 pb-1.5 pt-3 text-[11px] font-extrabold uppercase tracking-[.12em] text-frame-muted">{section.title}</p>
              {section.items.map(({ href, label, icon: Icon }) => {
                const isActive = href === active
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 whitespace-nowrap rounded-l-full px-3.5 py-3 font-bold transition-colors",
                      isActive
                        ? "bg-background text-foreground before:pointer-events-none before:absolute before:-top-6 before:right-0 before:size-6 before:bg-[radial-gradient(circle_at_0_0,transparent_23.5px,var(--background)_24px)] after:pointer-events-none after:absolute after:-bottom-6 after:right-0 after:size-6 after:bg-[radial-gradient(circle_at_0_100%,transparent_23.5px,var(--background)_24px)]"
                        : "text-frame-muted hover:text-frame-foreground"
                    )}
                  >
                    <Icon className={cn("size-5", isActive && "text-brand")} />
                    {label}
                  </Link>
                )
              })}
            </div>
          ))}

          <div className="mt-auto space-y-2 pr-5 pt-6">
            {!user.isPro && (
              <div className="paper grid gap-2.5 rounded-3xl bg-butter p-4">
                <p className="font-display text-[17px] font-semibold leading-tight">Unlock the whole course</p>
                <p className="text-[13px] font-semibold">Get PRO in the SAT Learner app. It works here too.</p>
                <a href={APP_STORE_URL} className="rounded-full bg-on-pastel py-2 text-center text-[13px] font-extrabold text-white">
                  Get the app
                </a>
              </div>
            )}
            <a href={siteUrl("/info/what-is-sat")} className="flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-bold text-frame-muted hover:text-frame-foreground">
              About the SAT <ExternalLink className="ml-auto size-3.5" />
            </a>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: siteUrl("/") })}
              className="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-bold text-[#FF8A7A] hover:bg-frame-line"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </div>
        </aside>

        {/* Phones: black top bar */}
        <header className="flex h-16 items-center justify-between px-4 text-frame-foreground md:hidden">
          <Brand />
          <ThemeSwitch onFrame />
        </header>

        <div className="min-h-[calc(100vh-4rem)] min-w-0 rounded-t-[28px] bg-background md:my-3 md:min-h-[calc(100vh-1.5rem)] md:rounded-l-[36px] md:rounded-tr-none">
          <div className="hidden items-center justify-end gap-3 px-8 pt-5 md:flex">
            <ThemeSwitch />
            <Link href="/profile" className="flex items-center gap-2.5 border-l pl-4">
              <span className="text-right leading-tight">
                <span className="block text-[14.5px] font-bold">{user.name ?? "Student"}</span>
                <span className="text-xs font-semibold text-muted-foreground">{user.isPro ? "PRO" : "Free plan"}</span>
              </span>
              <Avatar className="size-11">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="bg-butter font-display font-bold text-on-pastel">{user.name?.[0]?.toUpperCase() ?? "S"}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
          <main className="relative flex min-w-0 justify-center px-4 pb-28 pt-6 md:px-8 md:pb-10 md:pt-4">{children}</main>
        </div>

        {/* Phones: floating tab bar */}
        <nav
          aria-label="Main"
          className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 gap-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-[0_14px_30px_-12px_rgba(0,0,0,.5)] md:hidden"
        >
          {ITEMS.filter((i) => i.mobile).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={href === active ? "page" : undefined}
              className={cn(
                "grid size-12 place-items-center rounded-full transition-colors",
                href === active ? "bg-background text-foreground" : "opacity-75"
              )}
            >
              <Icon className="size-[22px]" />
            </Link>
          ))}
        </nav>
      </div>
    </SessionProvider>
  )
}
