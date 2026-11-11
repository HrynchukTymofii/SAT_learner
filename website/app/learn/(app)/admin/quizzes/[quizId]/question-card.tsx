"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { AlertTriangle, Check, ChevronDown, Copy, ImageIcon, Plus, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { tiptapToText } from "@/lib/tiptap-text"
import { deleteQuestion, duplicateQuestion, updateQuestion, type QuestionInput, type QuestionType } from "../../actions"
import { act, DeleteButton } from "../../_components/ui"
import { ImageField } from "../../_components/media-upload"

const RichEditor = dynamic(() => import("@/components/admin/rich-editor").then((m) => m.RichEditor), {
  ssr: false,
  loading: () => <div className="bg-muted h-32 animate-pulse rounded-2xl" />,
})

export const TYPE_LABEL: Record<QuestionType, string> = {
  single_choice: "Single choice",
  multiple_choice: "Multiple choice",
  true_false: "True / False",
  open_ended: "Open answer",
}

const LETTERS = "ABCDEFGHIJ"

/**
 * In the form, choice options carry their own "correct" flag, so renaming an option keeps it marked.
 * On save they become options[] + answers[] (answers = the correct options' text), as the quiz pages expect.
 */
type Choice = { text: string; correct: boolean }
type Form = Omit<QuestionInput, "options" | "answers"> & { choices: Choice[]; trueFalse: string; accepted: string[] }

function toForm(q: QuestionInput): Form {
  const { options, answers, ...rest } = q
  return {
    ...rest,
    choices: options.map((o) => ({ text: o, correct: answers.includes(o) })),
    trueFalse: answers.find((a) => a === "True" || a === "False") ?? "",
    accepted: q.questionType === "open_ended" && answers.length ? answers : [""],
  }
}

function toInput(f: Form): QuestionInput {
  const { choices, trueFalse, accepted, ...rest } = f
  if (f.questionType === "true_false") return { ...rest, options: ["True", "False"], answers: trueFalse ? [trueFalse] : [] }
  if (f.questionType === "open_ended") return { ...rest, options: [], answers: accepted.map((a) => a.trim()).filter(Boolean) }
  return { ...rest, options: choices.map((c) => c.text), answers: choices.filter((c) => c.correct && c.text.trim()).map((c) => c.text.trim()) }
}

export type CardHandle = { dirty: boolean; save: () => Promise<boolean> }

/** One quiz question: a summary row that expands in place into the full editor (like the Fibipals creator). */
export function QuestionCard({
  id,
  index,
  initial,
  open,
  onToggle,
  register,
  onChanged,
}: {
  id: string
  index: number
  initial: QuestionInput
  open: boolean
  onToggle: () => void
  /** Lets the quiz page save every edited question at once (Ctrl+S / the save bar). */
  register: (id: string, h: CardHandle | null) => void
  /** Called after a save/duplicate/delete so the page reloads; a new id gets opened. */
  onChanged: (openId?: string) => void
}) {
  const [form, setForm] = useState(() => toForm(initial))
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(toInput(toForm(initial))))
  const [saving, setSaving] = useState(false)
  // The editors are only mounted once the card is first opened, then kept (hidden) so edits survive collapsing
  const [opened, setOpened] = useState(open)
  useEffect(() => {
    if (open) setOpened(true)
  }, [open])

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))
  const dirty = useMemo(() => JSON.stringify(toInput(form)) !== savedJson, [form, savedJson])

  const save = async () => {
    if (saving) return false
    if (!dirty) return true
    setSaving(true)
    const input = toInput(form)
    const ok = await act(updateQuestion(id, input), `Question ${index + 1} saved`)
    if (ok) setSavedJson(JSON.stringify(input))
    setSaving(false)
    if (ok) onChanged()
    return !!ok
  }

  const saveRef = useRef(save)
  saveRef.current = save
  useEffect(() => {
    register(id, { dirty, save: () => saveRef.current() })
  }, [id, dirty, register])
  useEffect(() => () => register(id, null), [id, register])

  const setType = (t: QuestionType) =>
    setForm((f) => {
      let choices = f.choices
      // Single choice allows one correct option: keep only the first
      if (t === "single_choice") {
        let seen = false
        choices = choices.map((c) => {
          const correct = c.correct && !seen
          if (c.correct) seen = true
          return { ...c, correct }
        })
      }
      if ((t === "single_choice" || t === "multiple_choice") && choices.length < 2) choices = [...choices, { text: "", correct: false }, { text: "", correct: false }]
      return { ...f, questionType: t, choices }
    })

  const setChoice = (i: number, patch: Partial<Choice>) =>
    setForm((f) => ({
      ...f,
      choices: f.choices.map((c, j) => {
        if (j === i) return { ...c, ...patch }
        // Marking one correct in single choice unmarks the others
        if (patch.correct && f.questionType === "single_choice") return { ...c, correct: false }
        return c
      }),
    }))

  const isChoice = form.questionType === "single_choice" || form.questionType === "multiple_choice"
  const summary = tiptapToText(form.question)
  const noAnswer = toInput(form).answers.length === 0

  return (
    <div id={`q-${id}`} className="min-w-0 flex-1 scroll-mt-24">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full min-w-0 items-center gap-3 py-3 text-left">
        <span className="text-muted-foreground w-6 shrink-0 text-right text-xs font-bold tabular-nums">{index + 1}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{summary || <em className="text-muted-foreground">Empty question</em>}</span>
          <span className="text-muted-foreground flex items-center gap-2 text-xs">
            {TYPE_LABEL[form.questionType] || form.questionType} · {form.points} pt
            {form.questionImageUrl && <ImageIcon className="size-3.5" />}
            {noAnswer && (
              <span className="text-destructive inline-flex items-center gap-1 font-semibold">
                <AlertTriangle className="size-3.5" /> no correct answer
              </span>
            )}
            {dirty && <span className="text-primary font-semibold">● unsaved</span>}
          </span>
        </span>
        <ChevronDown className={cn("text-muted-foreground size-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {opened && (
        <div className={cn("space-y-5 border-t pt-4 pb-4", !open && "hidden")}>
          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TYPE_LABEL) as QuestionType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                      form.questionType === t ? "bg-primary text-primary-foreground border-transparent" : "hover:bg-muted",
                    )}
                  >
                    {TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`pts-${id}`}>Points</Label>
              <Input id={`pts-${id}`} type="number" min={1} max={100} value={form.points} onChange={(e) => set("points", Number(e.target.value))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Question</Label>
            <RichEditor compact value={initial.question} onChange={(v) => set("question", v)} placeholder="Question text" />
          </div>

          <div className="space-y-2">
            <Label>Picture under the question (optional)</Label>
            <ImageField value={form.questionImageUrl} onChange={(v) => set("questionImageUrl", v)} height={form.imageHeight} />
            {form.questionImageUrl && (
              <div className="flex items-center gap-3">
                <Label htmlFor={`ih-${id}`} className="shrink-0">Height</Label>
                <input id={`ih-${id}`} type="range" min={50} max={800} step={10} value={form.imageHeight} onChange={(e) => set("imageHeight", Number(e.target.value))} className="flex-1" />
                <span className="w-14 text-right text-sm tabular-nums">{form.imageHeight}px</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{form.questionType === "open_ended" ? "Accepted answers" : "Answer"}</Label>
            {isChoice && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">
                  {form.questionType === "single_choice" ? "Tick the one correct option." : "Tick every correct option."}
                </p>
                {form.choices.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={c.correct ? "Correct" : "Mark as correct"}
                      onClick={() => setChoice(i, { correct: !c.correct })}
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                        c.correct ? "bg-mint border-transparent text-[#0B0A0F]" : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {c.correct ? <Check className="size-4" /> : LETTERS[i]}
                    </button>
                    <Input value={c.text} onChange={(e) => setChoice(i, { text: e.target.value })} placeholder={`Option ${LETTERS[i]}`} maxLength={500} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove option"
                      disabled={form.choices.length <= 2}
                      onClick={() => set("choices", form.choices.filter((_, j) => j !== i))}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
                {form.choices.length < LETTERS.length && (
                  <Button type="button" variant="outline" size="sm" onClick={() => set("choices", [...form.choices, { text: "", correct: false }])}>
                    <Plus className="size-4" /> Add option
                  </Button>
                )}
              </div>
            )}

            {form.questionType === "true_false" && (
              <div className="flex gap-2">
                {["True", "False"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("trueFalse", v)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border-2 px-5 py-2 text-sm font-semibold",
                      form.trueFalse === v ? "bg-mint border-transparent text-[#0B0A0F]" : "hover:bg-muted",
                    )}
                  >
                    {form.trueFalse === v && <Check className="size-4" />} {v}
                  </button>
                ))}
              </div>
            )}

            {form.questionType === "open_ended" && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">Every way of writing the right answer that should count, e.g. 0.5 and 1/2.</p>
                {form.accepted.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input value={a} onChange={(e) => set("accepted", form.accepted.map((x, j) => (j === i ? e.target.value : x)))} placeholder="Answer" maxLength={200} />
                    <Button type="button" variant="ghost" size="icon" aria-label="Remove answer" disabled={form.accepted.length <= 1} onClick={() => set("accepted", form.accepted.filter((_, j) => j !== i))}>
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => set("accepted", [...form.accepted, ""])}>
                  <Plus className="size-4" /> Add answer
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Hint (optional)</Label>
            <RichEditor compact value={initial.hint} onChange={(v) => set("hint", v)} placeholder="Hint" />
            <ImageField value={form.hintImageUrl} onChange={(v) => set("hintImageUrl", v)} height={160} />
          </div>

          <div className="space-y-2">
            <Label>Explanation (shown after answering)</Label>
            <RichEditor compact value={initial.note} onChange={(v) => set("note", v)} placeholder="Explanation" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={save} disabled={!dirty || saving}>
                <Save className="size-4" /> {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (dirty && !(await save())) return
                  const copy = await act(duplicateQuestion(id), "Copied")
                  if (copy) onChanged(copy)
                }}
              >
                <Copy className="size-4" /> Duplicate
              </Button>
            </div>
            <DeleteButton
              what="question"
              warning="Students' saved answers to it are removed too. This can't be undone."
              onDelete={async () => {
                if (await act(deleteQuestion(id), "Question deleted")) onChanged()
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
