import { ArrowLeft, Check } from "lucide-react"
import { Brand } from "@/components/site/brand"
import { LineDoodle } from "@/components/site/doodles"
import { ThemeSwitch } from "@/components/site/theme-switch"
import { siteUrl } from "@/lib/urls"

// Login / register layout: black frame with the pitch on the left, the form on a light panel
export function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-frame lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* One centred column, so the pitch doesn't hug the edge on very wide screens */}
      <aside className="hidden flex-col items-center justify-between p-10 text-frame-foreground lg:flex">
        <Brand href={siteUrl("/")} className="w-full max-w-[460px] 2xl:max-w-[520px]" />
        <div className="w-full max-w-[460px] space-y-8 2xl:max-w-[520px]">
          <p className="max-w-[14ch] font-display text-5xl font-semibold leading-[1.05] 2xl:text-6xl tracking-tight">Score 750+ on SAT Math.</p>
          <div className="paper relative max-w-sm -rotate-3 rounded-[30px] bg-butter p-6 text-on-pastel">
            <p className="text-[13px] font-bold">Chapter 5 · Lesson 1</p>
            <p className="max-w-[7ch] font-display text-3xl font-semibold leading-[1.02]">Linear equations</p>
            <LineDoodle className="absolute right-4 top-6 h-28 w-28" />
            <p className="mt-10 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold">Continue lesson</p>
          </div>
          <ul className="space-y-2.5 font-semibold text-frame-muted">
            {["Video lessons and chapter quizzes", "Full exams scored 200–800", "Same progress on web and in the app"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <Check className="size-4 text-lav" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="w-full max-w-[460px] text-sm font-semibold text-frame-muted 2xl:max-w-[520px]">© {new Date().getFullYear()} SAT Learner</p>
      </aside>

      <header className="flex h-16 items-center justify-between px-4 text-frame-foreground lg:hidden">
        <Brand href={siteUrl("/")} />
        <ThemeSwitch onFrame />
      </header>

      <main className="flex min-h-[calc(100vh-4rem)] flex-col rounded-t-[28px] bg-background px-4 py-8 sm:px-8 lg:my-3 lg:mr-3 lg:min-h-[calc(100vh-1.5rem)] lg:rounded-[36px]">
        <div className="flex items-center justify-between">
          <a href={siteUrl("/")} className="inline-flex items-center gap-2 rounded-full border-[1.5px] bg-card px-4 py-2 text-sm font-bold hover:bg-accent">
            <ArrowLeft className="size-4" /> Home
          </a>
          <ThemeSwitch className="hidden lg:flex" />
        </div>
        <div className="mx-auto my-auto w-full max-w-[420px] py-10">
          <h1 className="text-[40px] font-semibold leading-tight">{title}</h1>
          <p className="mb-8 mt-1.5 text-muted-foreground">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  )
}

// "or continue with email" divider
export function OrDivider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      or with email
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}
