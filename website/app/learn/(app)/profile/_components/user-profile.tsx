"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { ArrowRight, Bookmark, BookOpen, ChevronRight, FileText, LogOut, Mail, Shield, Sparkles, Star, Target } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeSwitch } from "@/components/site/theme-switch"
import { LineDoodle } from "@/components/site/doodles"
import { CONTACT_EMAIL } from "@/lib/site"
import { siteUrl } from "@/lib/urls"
import { cn } from "@/lib/utils"

type ProfileProps = {
  name: string | null
  email: string | null
  image: string | null
  isPro: boolean
  joinedAt: string | null
  stats: { points: number; lessonsDone: number; quizzesDone: number; saved: number }
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]!.toUpperCase())
    .join("")

export default function UserProfile({ name, email, image, isPro, joinedAt, stats }: ProfileProps) {
  const joined = joinedAt && new Date(joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
  const tiles = [
    { label: "Points", value: stats.points, icon: Star, bg: "bg-lav" },
    { label: "Lessons done", value: stats.lessonsDone, icon: BookOpen, bg: "bg-mint" },
    { label: "Quizzes done", value: stats.quizzesDone, icon: Target, bg: "bg-butter" },
    { label: "Saved questions", value: stats.saved, icon: Bookmark, bg: "bg-rose", href: "/tests/saved" },
  ]

  return (
    <div className="grid w-full max-w-5xl gap-8">
      <h1 className="text-[32px] font-semibold leading-tight sm:text-[40px]">Profile</h1>

      <section className="paper relative flex flex-col items-start gap-5 overflow-hidden rounded-[32px] bg-lav p-7 sm:flex-row sm:items-center sm:p-8">
        <Avatar className="size-24 border-4 border-white sm:size-28">
          <AvatarImage src={image ?? undefined} alt={name ?? "Student"} />
          <AvatarFallback className="bg-on-pastel font-display text-3xl font-semibold text-lav">{name ? initials(name) : "S"}</AvatarFallback>
        </Avatar>
        <div className="relative z-10 grid gap-2">
          <h2 className="text-[28px] font-semibold leading-tight sm:text-[34px]">{name || "Student"}</h2>
          {email && (
            <p className="flex items-center gap-2 font-semibold">
              <Mail className="size-4" /> {email}
            </p>
          )}
          <div className="mt-1 flex flex-wrap gap-2">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold", isPro ? "bg-on-pastel text-butter" : "bg-white")}>
              {isPro ? <Sparkles className="size-3.5" /> : <Shield className="size-3.5" />}
              {isPro ? "PRO" : "Free plan"}
            </span>
            {joined && <span className="rounded-full bg-white/70 px-3.5 py-1.5 text-xs font-extrabold">Joined {joined}</span>}
          </div>
        </div>
        <LineDoodle className="pointer-events-none absolute -right-2 top-1/2 hidden h-44 w-44 -translate-y-1/2 opacity-80 md:block" />
      </section>

      <section className="grid gap-3.5">
        <h2 className="text-[23px] font-semibold">Your numbers</h2>
        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          {tiles.map(({ label, value, icon: Icon, bg, href }) => {
            const body = (
              <>
                <span className={cn("grid size-12 place-items-center rounded-2xl text-on-pastel", bg)}>
                  <Icon className="size-5" />
                </span>
                <span className="grid gap-0.5">
                  <span className="font-display text-4xl font-semibold tabular-nums tracking-tight">{value.toLocaleString("en-US")}</span>
                  <span className="text-sm font-bold text-muted-foreground">{label}</span>
                </span>
              </>
            )
            const cls = "grid gap-8 rounded-[28px] border bg-card p-5"
            return href ? (
              <Link key={label} href={href} className={cn(cls, "transition-colors hover:border-lav-2")}>
                {body}
              </Link>
            ) : (
              <div key={label} className={cls}>
                {body}
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid gap-3.5 lg:grid-cols-[1.1fr_1fr]">
        {isPro ? (
          <section className="paper grid content-start gap-3 rounded-[32px] bg-mint p-7">
            <p className="text-[11.5px] font-extrabold uppercase tracking-[.12em]">Your plan</p>
            <h2 className="text-[28px] font-semibold leading-tight">PRO is active</h2>
            <p className="font-semibold">
              Every lesson, quiz and exam is open on the web and in the app. You manage the subscription in the App Store or Google Play,
              wherever you bought it.
            </p>
          </section>
        ) : (
          <section className="grid content-start gap-4 rounded-[32px] bg-frame p-7 text-frame-foreground">
            <p className="text-[11.5px] font-extrabold uppercase tracking-[.12em] text-frame-muted">Your plan · Free</p>
            <h2 className="max-w-[18ch] text-[28px] font-semibold leading-tight">Unlock every lesson, quiz and exam</h2>
            <Link
              href="/pricing"
              className="inline-flex w-fit items-center gap-3 rounded-full bg-butter py-1.5 pl-5 pr-1.5 font-bold text-on-pastel"
            >
              See PRO
              <span className="grid size-9 place-items-center rounded-full bg-on-pastel text-butter">
                <ArrowRight className="size-4" />
              </span>
            </Link>
          </section>
        )}

        <section className="grid content-start rounded-[32px] border bg-card p-3">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="font-bold">Appearance</span>
            <ThemeSwitch />
          </div>
          <Row href={`mailto:${CONTACT_EMAIL}`} icon={Mail} label="Contact support" />
          <Row href={siteUrl("/privacy-policy")} icon={Shield} label="Privacy policy" />
          <Row href={siteUrl("/terms-of-service")} icon={FileText} label="Terms of service" />
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: siteUrl("/") })}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left font-bold text-destructive transition-colors hover:bg-rose hover:text-on-pastel"
          >
            <LogOut className="size-4" /> Log out
          </button>
        </section>
      </div>
    </div>
  )
}

function Row({ href, icon: Icon, label }: { href: string; icon: typeof Mail; label: string }) {
  return (
    <a href={href} className="flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition-colors hover:bg-accent">
      <Icon className="size-4 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </a>
  )
}
