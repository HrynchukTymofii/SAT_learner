import Link from "next/link"
import { BookOpen, Play } from "lucide-react"
import { appUrl } from "@/lib/urls"
import { APP_STORE_URL, CONTACT_EMAIL, PLAY_STORE_URL } from "@/lib/site"
import { Brand } from "./brand"

const COLUMNS = [
  {
    title: "Learn",
    links: [
      { href: "/sat-course", label: "SAT course" },
      { href: appUrl("/tests"), label: "Practice tests" },
      { href: appUrl("/tests/exam"), label: "Full practice exam" },
    ],
  },
  {
    title: "About the SAT",
    links: [
      { href: "/info/what-is-sat", label: "What is the SAT" },
      { href: "/info/how-sat-is-scored", label: "How it is scored" },
      { href: "/info/test-dates-registration", label: "Test dates" },
    ],
  },
  {
    title: "SAT Learner",
    links: [
      { href: APP_STORE_URL, label: "App Store" },
      { href: PLAY_STORE_URL, label: "Google Play" },
      { href: `mailto:${CONTACT_EMAIL}`, label: "Contact us" },
    ],
  },
]

// Black footer. A bump rises from it into the page and holds the main call to action
export function SiteFooter() {
  return (
    <footer className="relative mx-auto max-w-[1360px] px-4 pb-10 pt-20 text-frame-foreground sm:px-6">
      <svg
        aria-hidden
        viewBox="0 0 420 64"
        preserveAspectRatio="none"
        className="absolute left-1/2 top-0 h-16 w-[min(420px,92%)] -translate-x-1/2 -translate-y-[63px] text-frame"
      >
        <path d="M0 64C50 64 60 0 120 0H300C360 0 370 64 420 64Z" fill="currentColor" />
      </svg>
      <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-11 items-center gap-2">
        <Link href="/sat-course" aria-label="SAT course" className="hidden size-11 place-items-center rounded-full bg-lav text-on-pastel sm:grid">
          <BookOpen className="size-5" />
        </Link>
        <a href={appUrl("/register")} className="whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-extrabold text-on-pastel">
          Start learning free
        </a>
        <a href={appUrl("/tests")} aria-label="Practice tests" className="hidden size-11 place-items-center rounded-full bg-butter text-on-pastel sm:grid">
          <Play className="size-4 fill-current" />
        </a>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.3fr_2fr]">
        <div className="space-y-5">
          <Brand />
          <p className="max-w-[18ch] font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Your 750 starts with one lesson.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title} className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-[.12em] text-frame-muted">{col.title}</p>
              <ul className="space-y-2 font-semibold">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-frame-foreground/80 hover:text-frame-foreground">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-6xl flex-wrap justify-between gap-4 border-t border-frame-line pt-6 text-sm font-semibold text-frame-muted">
        <p>© {new Date().getFullYear()} SAT Learner. SAT is a trademark of the College Board, which is not affiliated with this site.</p>
        <div className="flex gap-5">
          <Link href="/privacy-policy" className="hover:text-frame-foreground">Privacy policy</Link>
          <Link href="/terms-of-service" className="hover:text-frame-foreground">Terms of service</Link>
        </div>
      </div>
    </footer>
  )
}
