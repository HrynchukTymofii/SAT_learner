"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookOpen, ChevronRight, CircleHelp, PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createLesson, createQuiz, deleteChapter, reorderChapterItems, updateChapter } from "../../actions"
import { act, AddForm, Back, DeleteButton, Panel, SortableList, StatusBadge, Toggle } from "../../_components/ui"

type Item = { id: string; type: "lesson" | "quiz"; title: string; isPublished: boolean; isFree: boolean; detail: string }
type Chapter = { id: string; title: string; description: string; isPublished: boolean; isFree: boolean }

export function ChapterEditor({ chapter, items }: { chapter: Chapter; items: Item[] }) {
  const router = useRouter()
  const [title, setTitle] = useState(chapter.title)
  const [description, setDescription] = useState(chapter.description)
  const [saving, setSaving] = useState(false)
  const dirty = title !== chapter.title || description !== chapter.description

  const save = async () => {
    setSaving(true)
    if (await act(updateChapter(chapter.id, { title, description }), "Chapter saved")) router.refresh()
    setSaving(false)
  }
  const toggle = async (data: { isPublished?: boolean; isFree?: boolean }) => {
    if (await act(updateChapter(chapter.id, data))) router.refresh()
  }

  return (
    <div className="space-y-6">
      <Back href="/admin">All chapters</Back>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{chapter.title}</h1>
        <StatusBadge published={chapter.isPublished} free={chapter.isFree} />
      </div>

      <Panel title="Chapter">
        <div className="space-y-2">
          <Label htmlFor="ch-title">Title</Label>
          <Input id="ch-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ch-desc">Description</Label>
          <Textarea id="ch-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={2000} />
        </div>
        <Button onClick={save} disabled={!dirty || saving || !title.trim()}>{saving ? "Saving…" : "Save"}</Button>
        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <Toggle label="Published" hint="Students can see this chapter" checked={chapter.isPublished} onChange={(v) => toggle({ isPublished: v })} />
          <Toggle label="Free" hint="Open without PRO" checked={chapter.isFree} onChange={(v) => toggle({ isFree: v })} />
        </div>
      </Panel>

      <Panel title="Lessons and quizzes">
        {items.length ? (
          <SortableList
            items={items}
            onReorder={(list) => act(reorderChapterItems(chapter.id, list.map(({ id, type }) => ({ id, type }))), "Order saved")}
            render={(it) => {
              const Icon = it.type === "quiz" ? CircleHelp : it.detail === "Video lesson" ? PlayCircle : BookOpen
              return (
                <Link href={`/admin/${it.type === "quiz" ? "quizzes" : "lessons"}/${it.id}`} className="flex min-w-0 flex-1 items-center gap-3 py-3">
                  <Icon className="text-muted-foreground size-5 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{it.title}</span>
                    <span className="text-muted-foreground text-xs">{it.detail}</span>
                  </span>
                  <StatusBadge published={it.isPublished} free={it.isFree} />
                  <ChevronRight className="text-muted-foreground size-4 shrink-0" />
                </Link>
              )
            }}
          />
        ) : (
          <p className="text-muted-foreground text-sm">Nothing here yet.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <AddForm
            placeholder="New lesson title"
            button="Add lesson"
            onAdd={async (t) => {
              const id = await act(createLesson(chapter.id, t))
              if (id) router.push(`/admin/lessons/${id}`)
              return id
            }}
          />
          <AddForm
            placeholder="New quiz title"
            button="Add quiz"
            onAdd={async (t) => {
              const id = await act(createQuiz(chapter.id, t))
              if (id) router.push(`/admin/quizzes/${id}`)
              return id
            }}
          />
        </div>
      </Panel>

      <div className="flex justify-end">
        <DeleteButton
          what="chapter"
          warning={`Deletes "${chapter.title}" with all its lessons, quizzes, questions and the students' progress in them. This can't be undone.`}
          onDelete={async () => {
            if (await act(deleteChapter(chapter.id), "Chapter deleted")) router.push("/admin")
          }}
        />
      </div>
    </div>
  )
}
