"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, Menu, X } from "lucide-react"
import { useAuth } from "@/lib/useAuth"
import { appUrl } from "@/lib/urls"
import { cn } from "@/lib/utils"
import { Brand } from "./brand"
import { ThemeSwitch } from "./theme-switch"

const LINKS = [
  { href: "/", label: "Home", match: (p: string) => p === "/" },
  { href: "/sat-course", label: "SAT course", match: (p: string) => p.startsWith("/sat-course") },
  { href: appUrl("/tests"), label: "Practice tests", match: () => false },
  { href: "/info", label: "About the SAT", match: (p: string) => p.startsWith("/info") },
]

// Avoids the SSR warning while still measuring before paint in the browser
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

// Black top bar. The frame "drips" into the page under the active link (the notch)
export function SiteHeader() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [notchX, setNotchX] = useState<number | null>(null)
  const activeIndex = LINKS.findIndex((l) => l.match(pathname))

  const placeNotch = useCallback(() => {
    const link = linkRefs.current[activeIndex]
    const header = headerRef.current
    // Hidden links (phone layout) have no size
    if (!link || !header || !link.offsetWidth) return setNotchX(null)
    const l = link.getBoundingClientRect()
    setNotchX(l.left + l.width / 2 - header.getBoundingClientRect().left)
  }, [activeIndex])

  useIsoLayoutEffect(() => {
    placeNotch()
    window.addEventListener("resize", placeNotch)
    document.fonts?.ready.then(placeNotch)
    return () => window.removeEventListener("resize", placeNotch)
  }, [placeNotch])

  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <header ref={headerRef} className="relative z-30 text-frame-foreground">
      <div className="mx-auto flex h-20 max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              ref={(el) => {
                linkRefs.current[i] = el
              }}
              aria-current={i === activeIndex ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-[15px] font-semibold transition-colors",
                i === activeIndex ? "text-frame-foreground" : "text-frame-muted hover:text-frame-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSwitch onFrame className="hidden sm:flex" />
          {isAuthenticated ? (
            <PrimaryLink href={appUrl("/")}>Open platform</PrimaryLink>
          ) : (
            <>
              <a
                href={appUrl("/login")}
                className="hidden rounded-full border-[1.5px] border-frame-line px-4 py-2 text-sm font-bold hover:border-frame-muted sm:block"
              >
                Log in
              </a>
              <PrimaryLink href={appUrl("/register")}>Start free</PrimaryLink>
            </>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-full bg-frame-line lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {notchX !== null && (
        <svg
          aria-hidden
          viewBox="0 0 150 26"
          preserveAspectRatio="none"
          className="pointer-events-none absolute top-full h-[26px] w-[150px] -translate-x-1/2 -translate-y-px text-frame transition-[left] duration-300 ease-[cubic-bezier(.3,1.4,.5,1)]"
          style={{ left: notchX }}
        >
          <path d="M0 0C28 0 34 26 75 26S122 0 150 0Z" fill="currentColor" />
        </svg>
      )}

      {menuOpen && (
        <div className="absolute inset-x-0 top-full z-40 px-4 pb-6 lg:hidden">
          <nav aria-label="Main" className="mx-auto grid max-w-md gap-1 rounded-3xl bg-frame p-3 shadow-2xl ring-1 ring-frame-line">
            {LINKS.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "rounded-2xl px-4 py-3 font-semibold",
                  i === activeIndex ? "bg-frame-line text-frame-foreground" : "text-frame-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-frame-line px-2 pt-3">
              <ThemeSwitch onFrame />
              {!isAuthenticated && (
                <a href={appUrl("/login")} className="px-3 py-2 font-bold">
                  Log in
                </a>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2.5 rounded-full bg-lav py-1.5 pl-4 pr-1.5 text-sm font-bold text-on-pastel transition-transform hover:-translate-y-px"
    >
      {children}
      <span className="grid size-7 place-items-center rounded-full bg-on-pastel text-white">
        <ArrowRight className="size-3.5" />
      </span>
    </a>
  )
}
