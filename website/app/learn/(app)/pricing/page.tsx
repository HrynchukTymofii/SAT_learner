import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { auth } from "@/lib/getAuth"
import { PlanList } from "@/components/home/sections"
import { APP_STORE_URL, PLAN_FREE, PLAN_PRO, PLAY_STORE_URL } from "@/lib/site"

export const metadata: Metadata = { title: "PRO · SAT Learner" }

const STEPS = [
  { title: "Get the app", text: "SAT Learner for iPhone or Android." },
  { title: "Log in with this account", text: "Same email, Google or Apple login as here." },
  { title: "Subscribe in the app", text: "PRO opens on the web too, no second payment." },
]

// PRO is sold in the mobile app only; this page explains what it unlocks and how to get it
export default async function PricingPage() {
  const { isPro } = await auth()

  return (
    <div className="grid w-full max-w-5xl gap-8">
      <div className="grid gap-2">
        <h1 className="text-[32px] font-semibold leading-tight sm:text-[40px]">{isPro ? "You have PRO" : "Unlock the whole course"}</h1>
        <p className="max-w-[60ch] text-muted-foreground">
          {isPro
            ? "Everything below is already open for you, on the web and in the app."
            : "Saved questions, wrong-answer review and the locked lessons are part of PRO. You buy it once in the app and it works here too."}
        </p>
      </div>

      {isPro && (
        <Link href="/" className="paper flex items-center gap-4 rounded-[32px] bg-mint p-7 font-semibold">
          <CheckCircle2 className="size-8 shrink-0" />
          <span>
            <span className="block font-display text-2xl font-semibold">PRO is active</span>
            Go back to your courses
          </span>
        </Link>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid content-start gap-5 rounded-[32px] border bg-card p-8">
          <h2 className="text-2xl font-semibold">Free</h2>
          <p className="font-display text-[54px] font-semibold leading-none tracking-tight">$0</p>
          <PlanList items={PLAN_FREE} />
          {!isPro && <p className="mt-2 rounded-full bg-secondary py-4 text-center font-extrabold">Your current plan</p>}
        </div>
        <div className="paper relative grid content-start gap-5 rounded-[32px] bg-lav p-8 text-on-pastel">
          <span className="absolute -top-3.5 right-7 rounded-full border-[3px] border-background bg-butter px-3.5 py-1 text-xs font-extrabold">
            Unlocks web and app
          </span>
          <h2 className="text-2xl font-semibold">PRO</h2>
          <p className="font-display text-[34px] font-semibold leading-[1.1] tracking-tight">Get it in the app</p>
          <PlanList items={PLAN_PRO} />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a href={APP_STORE_URL} className="rounded-full bg-on-pastel py-4 text-center font-extrabold text-white">App Store</a>
            <a href={PLAY_STORE_URL} className="rounded-full bg-on-pastel py-4 text-center font-extrabold text-white">Google Play</a>
          </div>
        </div>
      </div>

      {!isPro && (
        <section className="grid gap-3.5">
          <h2 className="text-[23px] font-semibold">How to get PRO</h2>
          <ol className="grid gap-3.5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="grid gap-6 rounded-[28px] border bg-card p-5">
                <span className="grid size-11 place-items-center rounded-full bg-foreground font-display text-lg font-semibold text-background">{i + 1}</span>
                <span className="grid gap-1">
                  <span className="font-display text-xl font-semibold">{step.title}</span>
                  <span className="text-sm font-semibold text-muted-foreground">{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="text-sm font-semibold text-muted-foreground">
            Already subscribed? PRO shows up here within about ten minutes. Logging out and back in makes it show up right away.
          </p>
        </section>
      )}
    </div>
  )
}
