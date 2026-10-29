import { Check, Clock, Play } from "lucide-react"
import { appUrl } from "@/lib/urls"
import { InkButton, OutlineButton } from "@/components/site/ui"

export function Hero({ lessonCount }: { lessonCount: number }) {
  return (
    <section className="grid items-center gap-12 pb-20 pt-14 lg:grid-cols-[1.05fr_.95fr] lg:pt-20">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border bg-card py-1.5 pl-1.5 pr-4 text-sm font-bold">
          <span className="rounded-full bg-butter px-2.5 py-0.5 text-xs text-on-pastel">Free to start</span>
          Lessons, drills and full exams in one place
        </span>
        <h1 className="isolate mb-5 mt-6 text-[clamp(44px,7vw,84px)] font-semibold leading-[1.02]">
          Score{" "}
          <span className="relative whitespace-nowrap">
            750+
            <span aria-hidden className="absolute inset-x-0 -bottom-1 -z-10 h-[.13em] rounded-full bg-lav-2" />
          </span>{" "}
          on SAT Math.
        </h1>
        <p className="mb-8 max-w-[46ch] text-lg text-muted-foreground sm:text-xl">
          {lessonCount ? `${lessonCount} short lessons` : "Short lessons"}, topic drills and timed exams. Learn on the web or in
          the app, and pick up exactly where you stopped.
        </p>
        <div className="flex flex-wrap gap-3">
          <InkButton href={appUrl("/register")}>Start learning free</InkButton>
          <OutlineButton href="/sat-course" icon={<Play className="size-4 fill-current" />}>
            See the course
          </OutlineButton>
        </div>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground">
          {["No card needed", "Free lessons to start", "Syncs with the app"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Check className="size-4 text-success" />
              {t}
            </li>
          ))}
        </ul>
      </div>

      <HeroCollage />
    </section>
  )
}

// Three tilted cards: a lesson, a checked question, a score
function HeroCollage() {
  return (
    <div aria-hidden className="relative mx-auto h-[440px] w-full max-w-[540px] sm:h-[500px]">
      <div className="paper absolute left-[2%] top-5 w-[64%] -rotate-[5deg] rounded-[30px] bg-lav p-6 text-on-pastel shadow-[0_30px_50px_-30px_rgba(40,20,80,.45)]">
        <p className="text-[13px] font-bold">Chapter 5 · Lesson 1</p>
        <p className="mt-1 max-w-[11ch] pr-14 font-display text-[28px] font-semibold leading-[1.05] sm:text-[30px]">Linear equations</p>
        <span className="mt-14 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-bold">
          <Clock className="size-4" /> 6 min lesson
        </span>
        <span className="absolute right-5 top-5 grid size-14 place-items-center rounded-full bg-white shadow-[0_0_0_10px_rgba(255,255,255,.4)] sm:size-16">
          <Play className="size-6 fill-current" />
        </span>
      </div>

      <div className="absolute right-0 top-[120px] z-10 w-[66%] rotate-[3deg] rounded-[30px] border bg-card p-5 shadow-[0_30px_50px_-30px_rgba(40,20,80,.45)] sm:w-[56%]">
        <div className="mb-3 flex justify-between text-[12.5px] font-bold text-muted-foreground">
          <span>Question 7 of 15</span>
          <span>14:32</span>
        </div>
        <p className="mb-3 font-display text-[17px] leading-snug">
          If <i className="font-serif">f</i>(2) = 9 and <i className="font-serif">f</i>(<i className="font-serif">x</i>) = 2
          <i className="font-serif">x</i>² − 3<i className="font-serif">x</i> + <i className="font-serif">k</i>, find{" "}
          <i className="font-serif">k</i>.
        </p>
        <div className="mt-2 flex items-center gap-2.5 rounded-2xl border-[1.5px] px-3 py-2 font-bold">
          <span className="grid size-6 place-items-center rounded-full border-[1.5px] text-xs">B</span>5
        </div>
        <div className="mt-2 flex items-center gap-2.5 rounded-2xl bg-mint px-3 py-2 font-bold text-on-pastel">
          <span className="grid size-6 place-items-center rounded-full bg-on-pastel text-xs text-white">C</span>7
          <Check className="ml-auto size-4" />
        </div>
      </div>

      <div className="paper absolute bottom-0 left-[8%] w-[50%] -rotate-2 rounded-[30px] bg-butter p-5 text-on-pastel shadow-[0_30px_50px_-30px_rgba(40,20,80,.45)]">
        <p className="text-[13px] font-bold">Practice exam score</p>
        <p className="my-1 font-display text-[52px] font-semibold leading-none tracking-tight sm:text-[58px]">720</p>
        <div className="mt-2 flex h-16 items-end gap-1.5">
          {[40, 55, 50, 72].map((h) => (
            <i key={h} className="flex-1 rounded-md bg-on-pastel/15" style={{ height: `${h}%` }} />
          ))}
          <i className="h-full flex-1 rounded-md bg-on-pastel" />
        </div>
      </div>

      <span className="absolute bottom-16 right-[6%] hidden -rotate-[8deg] rounded-full bg-foreground px-4 py-2.5 text-sm font-extrabold text-background sm:block">
        Scored 200–800
      </span>
    </div>
  )
}
