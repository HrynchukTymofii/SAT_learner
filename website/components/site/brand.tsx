import Link from "next/link"
import { cn } from "@/lib/utils"

// Logo: a lavender tile with ∑ and the name
export function Brand({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 font-display text-xl font-bold tracking-tight", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-lav text-[15px] text-on-pastel">∑</span>
      SAT Learner
    </Link>
  )
}
