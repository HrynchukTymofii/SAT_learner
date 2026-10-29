import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Building blocks shared by the marketing pages

type LinkProps = { href: string; children: React.ReactNode; className?: string; icon?: React.ReactNode }

const isExternal = (href: string) => /^(https?:|mailto:)/.test(href)

function SmartLink({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return isExternal(href) ? (
    <a href={href} className={className}>{children}</a>
  ) : (
    <Link href={href} className={className}>{children}</Link>
  )
}

// Black pill with a lavender circle at the end: the main action of a section
export function InkButton({ href, children, className, icon }: LinkProps) {
  return (
    <SmartLink
      href={href}
      className={cn(
        "group inline-flex items-center gap-3.5 rounded-full bg-foreground py-2 pl-6 pr-2 text-base font-bold text-background transition-transform hover:-translate-y-0.5",
        className
      )}
    >
      {children}
      <span className="grid size-11 place-items-center rounded-full bg-lav text-on-pastel transition-transform group-hover:translate-x-0.5">
        {icon ?? <ArrowRight className="size-5" />}
      </span>
    </SmartLink>
  )
}

export function OutlineButton({ href, children, className, icon }: LinkProps) {
  return (
    <SmartLink
      href={href}
      className={cn(
        "inline-flex h-[60px] items-center gap-2.5 rounded-full border-[1.5px] bg-card px-6 font-bold transition-colors hover:bg-accent",
        className
      )}
    >
      {icon}
      {children}
    </SmartLink>
  )
}

export function SectionHead({ title, text, className }: { title: React.ReactNode; text?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-10 flex flex-wrap items-end justify-between gap-5", className)}>
      <h2 className="max-w-[16ch] text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-[54px]">{title}</h2>
      {text && <p className="max-w-[44ch] text-lg text-muted-foreground">{text}</p>}
    </div>
  )
}

// Small rounded label, e.g. "FREE"
export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold text-on-pastel", className)}>
      {children}
    </span>
  )
}
