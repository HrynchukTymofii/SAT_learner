import Link from "next/link"
import { ArrowRight, ArrowUpRight, Calculator, Calendar, Check, FileText, Lock, Monitor, Smartphone } from "lucide-react"
import type { CourseOutline } from "@/lib/course-outline"
import { appUrl } from "@/lib/urls"
import { APP_STORE_URL, PLAN_FREE, PLAN_PRO, PLAY_STORE_URL } from "@/lib/site"
import { cn, plural } from "@/lib/utils"
import { InkButton, OutlineButton, Pill, SectionHead } from "@/components/site/ui"

const PASTELS = ["bg-lav", "bg-butter", "bg-mint"]

export function Stats({ outline }: { outline: CourseOutline | null }) {
  const tiles = [
    { value: outline?.lessonCount, label: "video lessons", bg: "bg-lav" },
    { value: outline?.quizCount, label: "chapter quizzes", bg: "bg-butter" },
    { value: outline?.chapters.length, label: "chapters, basics to advanced", bg: "bg-mint" },
  ].filter((t) => t.value)

  return (
    <section className="grid grid-cols-2 gap-3.5 pb-24 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className={cn("paper rounded-[26px] px-6 py-5 text-on-pastel", t.bg)}>
          <p className="font-display text-5xl font-semibold leading-none tracking-tight">{t.value}</p>
          <p className="mt-1 text-sm font-bold">{t.label}</p>
        </div>
      ))}
      <div className="rounded-[26px] border-2 border-dashed px-6 py-5">
        <p className="font-display text-5xl font-semibold leading-none tracking-tight">200–800</p>
        <p className="mt-1 text-sm font-bold text-muted-foreground">full exams, scored like the real test</p>
      </div>
    </section>
  )
}

const STEPS = [
  { title: "Learn the idea", text: "A short video and a worked example, one topic at a time.", tag: "Video lessons", color: "bg-lav" },
  { title: "Drill the topic", text: "Questions on just that topic, with an explanation after every answer.", tag: "Instant feedback", color: "bg-butter" },
  { title: "Take a full exam", text: "Timed like the real test. Every mistake goes to your review list.", tag: "Scored 200–800", color: "bg-mint" },
]

// Three cards joined by a dashed line, like a learning plan
export function Path() {
  return (
    <section className="pb-28">
      <SectionHead title="A plan that moves you forward" text="Each step leads to the next, so you always know what to do today." />
      <ol className="grid gap-6 lg:grid-cols-3 lg:gap-14">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            className={cn(
              "relative grid content-start gap-3 rounded-[30px] border bg-card p-7",
              i === 1 && "lg:mt-11",
              i === 2 && "lg:mt-22",
              // dashed connector to the next card
              i < 2 &&
                "lg:after:absolute lg:after:-right-[58px] lg:after:top-[70px] lg:after:h-[46px] lg:after:w-[58px] lg:after:rounded-tr-[18px] lg:after:border-r-2 lg:after:border-t-2 lg:after:border-dashed lg:after:border-[#47B375] lg:before:absolute lg:before:-right-[5px] lg:before:top-[65px] lg:before:z-10 lg:before:size-2.5 lg:before:rounded-full lg:before:bg-[#47B375]"
            )}
          >
            <span className={cn("absolute -top-[18px] right-5 grid size-11 place-items-center rounded-full font-display font-bold text-on-pastel", s.color)}>
              {i + 1}
            </span>
            <h3 className="text-[28px] font-semibold">{s.title}</h3>
            <p className="text-muted-foreground">{s.text}</p>
            <Pill className={cn("justify-self-start", s.color)}>{s.tag}</Pill>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Syllabus({ outline }: { outline: CourseOutline | null }) {
  if (!outline?.chapters.length) return null
  const shown = outline.chapters.slice(0, 6)

  return (
    <section className="pb-28">
      <SectionHead
        title="What the course covers"
        text={`${outline.chapters.length} chapters, from the basics to the hardest SAT questions. Lessons marked free are open to everyone.`}
      />
      <div className="grid gap-3.5 md:grid-cols-2">
        {shown.map((ch, i) => {
          const hasFree = [...ch.lessons, ...ch.quizzes].some((x) => x.isFree)
          return (
            <Link
              key={ch.id}
              href="/sat-course"
              className="flex items-center gap-4 rounded-3xl border bg-card p-3.5 pr-5 transition-colors hover:border-lav-2"
            >
              <span className={cn("paper grid size-[62px] shrink-0 place-items-center rounded-[18px] font-display text-xl font-bold text-on-pastel", PASTELS[i % 3])}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[17px] font-semibold">{ch.title}</span>
                <span className="text-sm font-semibold text-muted-foreground">
                  {plural(ch.lessons.length, "lesson")} · {plural(ch.quizzes.length, "quiz", "quizzes")}
                </span>
              </span>
              {hasFree ? <Pill className="bg-mint">FREE</Pill> : <Lock className="size-4 text-muted-foreground" />}
            </Link>
          )
        })}
      </div>
      {outline.chapters.length > shown.length && (
        <div className="mt-6 flex justify-center">
          <OutlineButton href="/sat-course" className="h-14">
            See all {outline.chapters.length} chapters <ArrowRight className="size-4" />
          </OutlineButton>
        </div>
      )}
    </section>
  )
}

// Phone app and web platform side by side
export function Devices() {
  return (
    <section className="grid gap-4 pb-28 md:grid-cols-2">
      <div className="paper relative grid min-h-[360px] content-start gap-3.5 overflow-hidden rounded-[36px] bg-butter p-8 text-on-pastel sm:p-9">
        <Smartphone className="size-7" />
        <h3 className="max-w-[12ch] text-[34px] font-semibold leading-tight sm:text-[38px]">Practice on the bus</h3>
        <p className="relative z-10 max-w-[30ch] font-semibold">The iPhone and Android app works offline and syncs when you're back online.</p>
        <div className="relative z-10 mt-2 flex flex-wrap gap-2.5">
          <StoreLink href={APP_STORE_URL}>App Store</StoreLink>
          <StoreLink href={PLAY_STORE_URL}>Google Play</StoreLink>
        </div>
        <div aria-hidden className="absolute -bottom-24 right-6 hidden w-[170px] rotate-[8deg] gap-2 rounded-[30px] border-[7px] border-on-pastel bg-white px-3 pb-24 pt-5 sm:grid">
          <i className="h-3 w-3/5 rounded-md bg-[#EFEAF7]" />
          <i className="h-[90px] rounded-2xl bg-butter" />
          <i className="h-[60px] rounded-2xl bg-lav" />
          <i className="h-3 rounded-md bg-[#EFEAF7]" />
        </div>
      </div>
      <div className="paper relative grid min-h-[360px] content-start gap-3.5 overflow-hidden rounded-[36px] bg-lav p-8 text-on-pastel sm:p-9">
        <Monitor className="size-7" />
        <h3 className="max-w-[12ch] text-[34px] font-semibold leading-tight sm:text-[38px]">Study on a big screen</h3>
        <p className="relative z-10 max-w-[30ch] font-semibold">Same account, same progress. Open the platform in any browser.</p>
        <div className="relative z-10 mt-2">
          <StoreLink href={appUrl("/")}>Open the platform</StoreLink>
        </div>
        <div aria-hidden className="absolute -bottom-14 -right-10 hidden h-[170px] w-[250px] grid-cols-[50px_1fr] gap-2.5 rounded-[20px] bg-on-pastel p-3 sm:grid">
          <i className="rounded-[10px] bg-[#24202B]" />
          <b className="grid content-start gap-2 rounded-[10px] bg-white p-2.5">
            <i className="h-10 rounded-lg bg-lav" />
            <i className="h-6 rounded-lg bg-butter" />
          </b>
        </div>
      </div>
    </section>
  )
}

function StoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="inline-flex items-center gap-2 rounded-2xl bg-on-pastel px-4 py-2.5 text-sm font-bold text-white">
      {children}
      <ArrowUpRight className="size-4" />
    </a>
  )
}


export function Plans() {
  return (
    <section className="pb-28">
      <SectionHead className="justify-center text-center [&_h2]:mx-auto" title="Start free. Upgrade when you're ready." />
      <div className="mx-auto grid max-w-[900px] gap-4 md:grid-cols-2">
        <div className="grid content-start gap-5 rounded-[32px] border bg-card p-8">
          <h3 className="text-2xl font-semibold">Free</h3>
          <p className="font-display text-[54px] font-semibold leading-none tracking-tight">$0</p>
          <PlanList items={PLAN_FREE} />
          <a href={appUrl("/register")} className="mt-2 rounded-full bg-secondary py-4 text-center font-extrabold hover:bg-accent">
            Create a free account
          </a>
        </div>
        <div className="paper relative grid content-start gap-5 rounded-[32px] bg-lav p-8 text-on-pastel">
          <span className="absolute -top-3.5 right-7 rounded-full border-[3px] border-background bg-butter px-3.5 py-1 text-xs font-extrabold">
            Unlocks web and app
          </span>
          <h3 className="text-2xl font-semibold">PRO</h3>
          <p className="font-display text-[34px] font-semibold leading-[1.1] tracking-tight">Get it in the app</p>
          <PlanList items={PLAN_PRO} />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a href={APP_STORE_URL} className="rounded-full bg-on-pastel py-4 text-center font-extrabold text-white">App Store</a>
            <a href={PLAY_STORE_URL} className="rounded-full bg-on-pastel py-4 text-center font-extrabold text-white">Google Play</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function PlanList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2.5 font-semibold">
      {items.map((t) => (
        <li key={t} className="flex items-center gap-2.5">
          <Check className="size-[18px] shrink-0" />
          {t}
        </li>
      ))}
    </ul>
  )
}

const ARTICLES = [
  { href: "/info/what-is-sat", title: "What is the SAT?", text: "Sections, timing and what to expect on test day.", icon: FileText, bg: "bg-lav" },
  { href: "/info/how-sat-is-scored", title: "How the SAT is scored", text: "What 200–800 per section means for your college list.", icon: Calculator, bg: "bg-butter" },
  { href: "/info/test-dates-registration", title: "Test dates & registration", text: "Upcoming dates, deadlines and how to sign up.", icon: Calendar, bg: "bg-mint" },
]

export function AboutSat() {
  return (
    <section className="pb-28">
      <SectionHead title="New to the SAT?" text="Start with the basics. Short guides, no sign-up needed." />
      <div className="grid gap-4 md:grid-cols-3">
        {ARTICLES.map(({ href, title, text, icon: Icon, bg }) => (
          <Link key={href} href={href} className="group grid gap-10 rounded-[30px] border bg-card p-6 transition-colors hover:border-lav-2">
            <span className={cn("grid size-12 place-items-center rounded-2xl text-on-pastel", bg)}>
              <Icon className="size-5" />
            </span>
            <span className="grid gap-1.5">
              <span className="flex items-center justify-between font-display text-xl font-semibold">
                {title}
                <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span className="text-muted-foreground">{text}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

const FAQ = [
  {
    q: "Is SAT Learner free?",
    a: "Yes. Making an account is free, and lessons and quizzes marked FREE are open to everyone. PRO unlocks the rest of the course, every practice test and your stats.",
  },
  {
    q: "How do I get PRO?",
    a: "Buy it in the SAT Learner app on iPhone or Android. Log in on the website with the same account and PRO works here too.",
  },
  {
    q: "Do I need the app?",
    a: "No. Everything works in the browser. The app is handy for practicing on the go, and your progress syncs between the two.",
  },
  {
    q: "What does a full practice exam look like?",
    a: "It is timed like the real test and scored on the same 200–800 scale. Questions you get wrong are saved so you can redo them later.",
  },
]

export function Faq() {
  return (
    <section className="pb-16">
      <SectionHead title="Questions" />
      <div className="grid gap-3">
        {FAQ.map(({ q, a }) => (
          <details key={q} className="group rounded-3xl border bg-card px-6 py-5 open:bg-card [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
              {q}
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 max-w-[70ch] text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>
      <div className="mt-10 flex justify-center">
        <InkButton href={appUrl("/register")}>Start learning free</InkButton>
      </div>
    </section>
  )
}
