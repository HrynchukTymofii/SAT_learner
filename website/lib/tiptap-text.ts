/** Plain-text preview of stored Tiptap JSON (formulas shown as their LaTeX), for lists. */
export function tiptapToText(value: string | null | undefined, max = 140): string {
  if (!value) return ""
  let out = ""
  try {
    const walk = (n: { type?: string; text?: string; attrs?: { latex?: string }; content?: unknown[] }) => {
      if (out.length > max) return
      if (n.type === "text") out += n.text || ""
      else if (n.type === "inlineMath" || n.type === "blockMath") out += ` ${n.attrs?.latex || ""} `
      else if (n.type === "image") out += " [image] "
      if (Array.isArray(n.content)) n.content.forEach((c) => walk(c as typeof n))
      if (n.type === "paragraph" || n.type === "heading") out += " "
    }
    walk(JSON.parse(value))
  } catch {
    out = value.replace(/<[^>]*>/g, " ")
  }
  out = out.replace(/\s+/g, " ").trim()
  return out.length > max ? `${out.slice(0, max)}…` : out
}
