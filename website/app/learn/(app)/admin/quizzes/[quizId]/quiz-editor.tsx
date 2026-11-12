"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronsDownUp, ChevronsUpDown, ExternalLink, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createQuestion, deleteQuiz, reorderQuestions, updateQuiz, type QuestionInput } from "../../actions"
import { act, Back, DeleteButton, Panel, SaveBar, SortableList, StatusBadge, Toggle, useSaveShortcut, useUnsavedWarning } from "../../_components/ui"
import { QuestionCard, type CardHandle } from "./question-card"

type Quiz = { id: string; title: string; description: string; isPublished: boolean; isFree: boolean; maxScore: number }
type Q = { id: string; data: QuestionInput }

export function QuizEditor({
  quiz,
  chapter,
  questions,
  openId,
}: {
  quiz: Quiz
  chapter: { id: string; title: string }
  questions: Q[]
  openId?: string
}) {
  const router = useRouter()
  const [title, setTitle] = useState(quiz.title)
  const [description, setDescription] = useState(quiz.description)
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState(false)
  const dirty = title !== quiz.title || description !== quiz.description

  // Which questions are expanded
  const [open, setOpen] = useState<Set<string>>(() => new Set(openId ? [openId] : []))
  const toggleOpen = (id: string) =>
    setOpen((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  const allOpen = questions.length > 0 && questions.every((q) => open.has(q.id))

  useEffect(() => {
    if (openId) document.getElementById(`q-${openId}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [openId])

  // Edited questions, so they can all be saved at once
  const cards = useRef(new Map<string, CardHandle>())
  const [dirtyIds, setDirtyIds] = useState<string[]>([])
  const register = useCallback((id: string, h: CardHandle | null) => {
    if (h) cards.current.set(id, h)
    else cards.current.delete(id)
    setDirtyIds((prev) => {
      const isDirty = !!h?.dirty
      if (isDirty === prev.includes(id)) return prev
      return isDirty ? [...prev, id] : prev.filter((x) => x !== id)
    })
  }, [])
  const [savingAll, setSavingAll] = useState(false)
  const saveAll = async () => {
    if (savingAll) return
    setSavingAll(true)
    for (const h of cards.current.values()) if (h.dirty) await h.save()
    setSavingAll(false)
  }
  useSaveShortcut(saveAll)
  useUnsavedWarning(dirtyIds.length > 0)

  const onChanged = (newId?: string) => {
    if (newId) {
      setOpen((s) => new Set(s).add(newId))
      requestAnimationFrame(() => setTimeout(() => document.getElementById(`q-${newId}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 300))
    }
    router.refresh()
  }

  const save = async () => {
    setSaving(true)
    if (await act(updateQuiz(quiz.id, { title, description }), "Quiz saved")) router.refresh()
    setSaving(false)
  }
  const toggle = async (data: { isPublished?: boolean; isFree?: boolean }) => {
    if (!(await act(updateQuiz(quiz.id, data)))) return false
    router.refresh()
    return true
  }
  const add = async () => {
    setAdding(true)
    const id = await act(createQuestion(quiz.id))
    if (id) onChanged(id)
    setAdding(false)
  }

  return (
    <div className="space-y-6 pb-24">
      <Back href={`/admin/chapters/${chapter.id}`}>{chapter.title}</Back>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{quiz.title}</h1>
        <div className="flex items-center gap-3">
          <StatusBadge published={quiz.isPublished} free={quiz.isFree} />
          <a href={`/course/${chapter.id}/quizzes/${quiz.id}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-semibold">
            View <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>

      <Panel title="Quiz">
        <div className="space-y-2">
          <Label htmlFor="q-title">Title</Label>
          <Input id="q-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="q-desc">Description</Label>
          <Textarea id="q-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={2000} />
        </div>
        <Button onClick={save} disabled={!dirty || saving || !title.trim()}>{saving ? "Saving…" : "Save"}</Button>
        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <Toggle label="Published" hint="Students can take this quiz" checked={quiz.isPublished} onChange={(v) => toggle({ isPublished: v })} />
          <Toggle label="Free" hint="Open without PRO" checked={quiz.isFree} onChange={(v) => toggle({ isFree: v })} />
        </div>
      </Panel>

      <Panel
        title={`Questions (${questions.length}, ${quiz.maxScore} points)`}
        action={
          <div className="flex gap-2">
            {questions.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => setOpen(allOpen ? new Set() : new Set(questions.map((q) => q.id)))}>
                {allOpen ? <ChevronsDownUp className="size-4" /> : <ChevronsUpDown className="size-4" />}
                {allOpen ? "Collapse all" : "Expand all"}
              </Button>
            )}
            <Button size="sm" onClick={add} disabled={adding}>
              <Plus className="size-4" /> {adding ? "Adding…" : "Add question"}
            </Button>
          </div>
        }
      >
        {questions.length ? (
          <SortableList
            items={questions}
            handleAlign="top"
            onReorder={(list) => act(reorderQuestions(quiz.id, list.map((q) => q.id)), "Order saved")}
            render={(q, i) => (
              <QuestionCard
                key={q.id}
                id={q.id}
                index={i}
                initial={q.data}
                open={open.has(q.id)}
                onToggle={() => toggleOpen(q.id)}
                register={register}
                onChanged={onChanged}
              />
            )}
          />
        ) : (
          <p className="text-muted-foreground text-sm">No questions yet.</p>
        )}
      </Panel>

      <div className="flex justify-end">
        <DeleteButton
          what="quiz"
          warning={`Deletes "${quiz.title}", its ${questions.length} questions and all students' results for it. This can't be undone.`}
          onDelete={async () => {
            if (await act(deleteQuiz(quiz.id), "Quiz deleted")) router.push(`/admin/chapters/${chapter.id}`)
          }}
        />
      </div>

      <SaveBar dirty={dirtyIds.length > 0} saving={savingAll} onSave={saveAll} />
    </div>
  )
}
