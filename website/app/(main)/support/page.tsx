import type { Metadata } from "next"
import { ChevronDown, Mail } from "lucide-react"
import { APP_STORE_URL, CONTACT_EMAIL, PLAY_STORE_URL } from "@/lib/site"
import { InkButton, OutlineButton, Pill } from "@/components/site/ui"

export const metadata: Metadata = {
  title: "Support · SAT Learner",
  description: "Help with your SAT Learner account, PRO subscription and the app. Answers to common questions and how to reach us.",
}

const MAIL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("SAT Learner support")}`

const FAQ = [
  {
    q: "I bought PRO but it doesn't show up",
    a: "Make sure you're logged in with the same account you used in the app. In the app, open the PRO upgrade screen and tap Restore purchases. If PRO still doesn't appear, email us with your account email and the store receipt.",
  },
  {
    q: "How do I cancel or manage my subscription?",
    a: "Subscriptions are billed by the App Store or Google Play, so you manage and cancel them there. On iPhone: Settings → your name → Subscriptions. On Android: Google Play → Profile → Payments & subscriptions → Subscriptions.",
  },
  {
    q: "How do I get a refund?",
    a: "Refunds are handled by the store you paid through. For Apple, request one at reportaproblem.apple.com. For Google Play, request one from your order history in the Play Store.",
  },
  {
    q: "Does my progress sync between the app and the website?",
    a: "Yes. Log in with the same account on both and your lessons, quiz results and PRO access are shared.",
  },
  {
    q: "I can't log in to my account",
    a: "Check that you're using the same sign-in method you signed up with (email and password, or Google). If you still can't get in, email us from the address on your account and we'll help.",
  },
  {
    q: "How do I delete my account?",
    a: "In the app, open Settings and choose Delete account. You can also email us from the address on your account and we'll delete it and its data.",
  },
  {
    q: "I found a mistake in a question or lesson",
    a: "Thank you! Email us the chapter and question (a screenshot is perfect) and we'll fix it.",
  },
]

// Support page: common questions and how to reach us. Also the support URL for the app store listings
const SupportPage = () => {
  return (
    <div className="pb-6 pt-12 lg:pt-16">
      <section className="grid items-center gap-10 pb-16 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <Pill className="bg-mint">Support</Pill>
          <h1 className="mb-4 mt-5 text-[clamp(40px,6vw,68px)] font-semibold leading-[1.03]">How can we help?</h1>
          <p className="mb-7 max-w-[48ch] text-lg text-muted-foreground">
            Questions about your account, PRO or the app? Check the answers below, or write to us. We usually reply within 1–2 business
            days.
          </p>
          <div className="flex flex-wrap gap-3">
            <InkButton href={MAIL} icon={<Mail className="size-5" />}>
              Email support
            </InkButton>
          </div>
        </div>

        <div className="paper rounded-[36px] bg-lav p-7 text-on-pastel sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[.12em] opacity-70">Write to us</p>
          <a href={MAIL} className="mt-2 block break-all text-2xl font-semibold underline-offset-4 hover:underline sm:text-3xl">
            {CONTACT_EMAIL}
          </a>
          <p className="mt-5 font-semibold opacity-80">To help us answer faster, include:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-medium opacity-80">
            <li>The email on your SAT Learner account</li>
            <li>Your device (iPhone, Android or web)</li>
            <li>What happened, with a screenshot if you can</li>
          </ul>
        </div>
      </section>

      <section className="pb-16">
        <h2 className="mb-8 text-4xl font-semibold leading-[1.05] sm:text-5xl">Common questions</h2>
        <div className="grid gap-3">
          {FAQ.map((item) => (
            <details key={item.q} className="group rounded-3xl border bg-card px-6 py-5 open:pb-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 max-w-[70ch] text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-[36px] bg-butter p-7 text-on-pastel sm:p-10">
        <h2 className="max-w-[20ch] text-3xl font-semibold leading-tight sm:text-4xl">Get the app</h2>
        <p className="mb-6 mt-2 max-w-[48ch] font-medium opacity-80">Same course, same account, on iPhone and Android.</p>
        <div className="flex flex-wrap gap-3">
          <OutlineButton href={APP_STORE_URL} className="text-foreground">App Store</OutlineButton>
          <OutlineButton href={PLAY_STORE_URL} className="text-foreground">Google Play</OutlineButton>
        </div>
      </section>
    </div>
  )
}

export default SupportPage
