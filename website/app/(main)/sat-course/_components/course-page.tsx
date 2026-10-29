import { BookOpen, Check, ChevronDown, CircleHelp, Clock, Lock, Play } from "lucide-react"
import type { CourseOutline, OutlineItem } from "@/lib/course-outline"
import { appUrl } from "@/lib/urls"
import { cn, plural } from "@/lib/utils"
import LessonYouTubeVideo from "@/components/lightYouTubeVideo"
import { ParabolaDoodle } from "@/components/site/doodles"
import { InkButton, OutlineButton, Pill, SectionHead } from "@/components/site/ui"

const PASTELS = ["bg-lav", "bg-butter", "bg-mint"]

const PROMISES = [
  "Solve linear equations and systems quickly, without second-guessing",
  "Handle quadratics, functions and graphs, including the tricky ones",
  "Read word problems and turn them into the right equation",
  "Know geometry and trigonometry formulas you actually need",
  "Pace yourself so you finish every module on time",
  "Walk into test day knowing what each question type looks like",
]

const FAQ = [
  {
    q: "Which lessons are free?",
    a: "Lessons and quizzes marked FREE below are open to anyone with a free account. PRO unlocks everything else.",
  },
  {
    q: "Do I need to know a lot of math already?",
    a: "No. Each chapter starts from the basics and builds up to the hardest SAT questions on that topic.",
  },
  {
    q: "Can I study on my phone?",
    a: "Yes. The SAT Learner app on iPhone and Android has the same course, and your progress syncs with the website.",
  },
  {
    q: "How do I get PRO?",
    a: "Buy it in the app. Log in on the website with the same account and PRO works here too.",
  },
]

// Marketing page for the course: what it teaches, chapter by chapter. Server-rendered, no user data.
const CoursePage = ({ course }: { course: CourseOutline }) => {
  const firstFree = course.chapters
    .flatMap((ch) => ch.lessons.filter((l) => l.isFree).map((l) => ({ chapterId: ch.id, id: l.id })))
    .at(0)

  return (
    <div className="pb-6 pt-12 lg:pt-16">
      {/* Hero */}
      <section className="grid items-center gap-10 pb-20 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <Pill className="bg-butter">SAT Math course</Pill>
          <h1 className="mb-4 mt-5 text-[clamp(40px,6vw,68px)] font-semibold leading-[1.03]">{course.title}</h1>
          <p className="mb-7 max-w-[48ch] text-lg text-muted-foreground">
            {course.description ||
              "Everything on the SAT Math section, one topic at a time: a short video, then quizzes to lock it in. Free lessons are marked below."}
          </p>
          <dl className="mb-8 flex flex-wrap gap-x-7 gap-y-3">
            <Fact icon={<BookOpen className="size-[18px]" />} value={course.chapters.length} label="chapters" />
            <Fact icon={<Play className="size-[18px]" />} value={course.lessonCount} label="lessons" />
            <Fact icon={<CircleHelp className="size-[18px]" />} value={course.quizCount} label="quizzes" />
          </dl>
          <div className="flex flex-wrap gap-3">
            <InkButton href={appUrl("/register")}>Start learning free</InkButton>
            {firstFree && (
              <OutlineButton href={appUrl(`/course/${firstFree.chapterId}/lessons/${firstFree.id}`)} icon={<Play className="size-4 fill-current" />}>
                Try a free lesson
              </OutlineButton>
            )}
          </div>
        </div>

        <div className="paper relative rounded-[36px] bg-lav p-3 text-on-pastel sm:p-4">
          {course.courseVideoUrl ? (
            <div className="overflow-hidden rounded-[26px] bg-on-pastel">
              <LessonYouTubeVideo youTubeVideoUrl={course.courseVideoUrl} />
            </div>
          ) : (
            <div className="grid aspect-video place-items-center">
              <ParabolaDoodle className="h-4/5 w-4/5" />
            </div>
          )}
          <span className="absolute -bottom-4 left-8 inline-flex items-center gap-2 rounded-full bg-on-pastel px-4 py-2.5 text-sm font-bold text-white">
            <Clock className="size-4" /> Learn at your own pace
          </span>
        </div>
      </section>

      {/* Chapters */}
      <section className="pb-24">
        <SectionHead
          title="Chapter by chapter"
          text={`${course.lessonCount} lessons and ${course.quizCount} quizzes. Open a chapter to see what's inside.`}
        />
        <div className="grid gap-3">
          {course.chapters.map((ch, i) => {
            const items = [...ch.lessons.map((l) => ({ ...l, type: "lesson" as const })), ...ch.quizzes.map((q) => ({ ...q, type: "quiz" as const }))]
            const freeCount = items.filter((x) => x.isFree).length
            return (
              <details key={ch.id} open={i === 0} className="group rounded-[28px] border bg-card [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center gap-4 p-3.5 pr-5">
                  <span className={cn("paper grid size-[58px] shrink-0 place-items-center rounded-[18px] font-display text-xl font-bold text-on-pastel", PASTELS[i % 3])}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-semibold leading-snug">{ch.title}</span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      {plural(ch.lessons.length, "lesson")} · {plural(ch.quizzes.length, "quiz", "quizzes")}
                    </span>
                  </span>
                  {freeCount > 0 && <Pill className="hidden bg-mint sm:inline-flex">{freeCount} FREE</Pill>}
                  <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <ul className="grid gap-1 px-3.5 pb-4 sm:pl-[90px]">
                  {items.map((item) => (
                    <ItemRow key={item.id} item={item} chapterId={ch.id} />
                  ))}
                </ul>
              </details>
            )
          })}
        </div>
      </section>

      {/* Outcomes */}
      <section className="paper mb-24 grid gap-8 rounded-[36px] bg-butter p-8 text-on-pastel sm:p-12 lg:grid-cols-[.8fr_1.2fr]">
        <h2 className="text-4xl font-semibold leading-[1.05] sm:text-5xl">By the end, you'll…</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {PROMISES.map((p) => (
            <li key={p} className="flex gap-3 rounded-2xl bg-white/70 p-4 font-semibold">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-on-pastel text-white">
                <Check className="size-3.5" />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section>
        <SectionHead title="Questions" />
        <div className="grid gap-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group rounded-3xl border bg-card px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
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
    </div>
  )
}

function Fact({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-10 place-items-center rounded-full border-[1.5px] bg-card">{icon}</span>
      <span>
        <dt className="sr-only">{label}</dt>
        <dd className="font-bold">
          {value} <span className="font-semibold text-muted-foreground">{label}</span>
        </dd>
      </span>
    </div>
  )
}

// Free items open on the platform (it asks logged-out visitors to log in); the rest are listed only
function ItemRow({ item, chapterId }: { item: OutlineItem & { type: "lesson" | "quiz" }; chapterId: string }) {
  const Icon = item.type === "lesson" ? Play : CircleHelp
  const body = (
    <>
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl text-on-pastel", item.type === "lesson" ? "bg-lav" : "bg-butter")}>
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate font-semibold">{item.title}</span>
      {item.isFree ? <Pill className="bg-mint">FREE</Pill> : <Lock className="size-4 shrink-0 text-muted-foreground" />}
    </>
  )
  return (
    <li>
      {item.isFree ? (
        <a
          href={appUrl(`/course/${chapterId}/${item.type === "lesson" ? "lessons" : "quizzes"}/${item.id}`)}
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-accent"
        >
          {body}
        </a>
      ) : (
        <div className="flex items-center gap-3 px-3 py-2.5">{body}</div>
      )}
    </li>
  )
}

export default CoursePage
