import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { Brand } from "@/components/site/brand"
import { InkButton, OutlineButton } from "@/components/site/ui"
import { appUrl, siteUrl } from "@/lib/urls"

export const metadata: Metadata = { title: "Page not found · SAT Learner" }

// One 404 for both hosts: the marketing site and the platform
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-frame p-3">
      <header className="flex h-14 items-center px-3 text-frame-foreground sm:px-5">
        <Brand href={siteUrl("/")} />
      </header>
      <main className="flex flex-1 items-center justify-center rounded-[28px] bg-background px-4 py-16 sm:rounded-[40px]">
        <div className="grid w-full max-w-4xl items-center gap-10 md:grid-cols-[1fr_1.1fr]">
          <div className="paper relative mx-auto aspect-square w-full max-w-[300px] -rotate-3 rounded-[36px] bg-lav p-6 text-on-pastel">
            <p className="text-[13px] font-bold">Question 404</p>
            <p className="mt-1 font-display text-2xl font-semibold leading-tight">Solve for the page:</p>
            <p className="mt-4 font-display text-[44px] font-semibold leading-none">x = ∅</p>
            <svg viewBox="0 0 200 90" className="absolute inset-x-6 bottom-6" aria-hidden fill="none" stroke="#0B0A0F" strokeWidth="2.4" strokeLinecap="round">
              <path d="M4 70h192" />
              {/* Never touches the axis: no real roots */}
              <path d="M24 4c36 64 116 64 152 0" strokeWidth="4" />
              <circle cx="100" cy="52" r="7" fill="#FEE7A6" />
            </svg>
          </div>
          <div className="grid justify-items-start gap-4">
            <p className="font-display text-[88px] font-semibold leading-none tracking-tight sm:text-[112px]">404</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">This page has no solution.</h1>
            <p className="max-w-[40ch] text-lg text-muted-foreground">The link is broken or the page moved. Your progress is safe.</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <InkButton href={appUrl("/")}>Go to my courses</InkButton>
              <OutlineButton href={siteUrl("/")} icon={<ArrowLeft className="size-4" />}>
                Home page
              </OutlineButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
