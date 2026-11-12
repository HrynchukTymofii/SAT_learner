"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteLesson, updateLesson } from "../../actions"
import { act, Back, DeleteButton, Panel, SaveBar, StatusBadge, Toggle, useSaveShortcut, useUnsavedWarning } from "../../_components/ui"
import { VideoField } from "../../_components/media-upload"

const RichEditor = dynamic(() => import("@/components/admin/rich-editor").then((m) => m.RichEditor), {
  ssr: false,
  loading: () => <div className="bg-muted h-[50vh] animate-pulse rounded-2xl" />,
})

type Lesson = {
  id: string
  title: string
  content: string
  videoUrl: string
  youTubeVideoUrl: string
  points: number
  isPublished: boolean
  isFree: boolean
}

export function LessonEditor({ lesson, chapter }: { lesson: Lesson; chapter: { id: string; title: string } }) {
  const router = useRouter()
  const [form, setForm] = useState(lesson)
  const [saved, setSaved] = useState(lesson)
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof Lesson>(k: K, v: Lesson[K]) => setForm((f) => ({ ...f, [k]: v }))

  const fields = ["title", "content", "videoUrl", "youTubeVideoUrl", "points"] as const
  const dirty = fields.some((k) => form[k] !== saved[k])
  useUnsavedWarning(dirty)

  const save = async () => {
    if (!dirty || saving) return
    if (!form.title.trim()) return void act(Promise.resolve({ ok: false as const, error: "Title is required" }))
    setSaving(true)
    const { title, content, videoUrl, youTubeVideoUrl, points } = form
    if (await act(updateLesson(lesson.id, { title, content, videoUrl, youTubeVideoUrl, points }), "Lesson saved")) {
      setSaved((s) => ({ ...s, title, content, videoUrl, youTubeVideoUrl, points }))
      router.refresh()
    }
    setSaving(false)
  }
  useSaveShortcut(save)

  const toggle = async (data: { isPublished?: boolean; isFree?: boolean }) => {
    if (!(await act(updateLesson(lesson.id, data)))) return false
    setForm((f) => ({ ...f, ...data }))
    setSaved((s) => ({ ...s, ...data }))
    return true
  }

  return (
    <div className="space-y-6 pb-24">
      <Back href={`/admin/chapters/${chapter.id}`}>{chapter.title}</Back>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{saved.title}</h1>
        <div className="flex items-center gap-3">
          <StatusBadge published={form.isPublished} free={form.isFree} />
          <a href={`/course/${chapter.id}/lessons/${lesson.id}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-semibold">
            View <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>

      <Panel title="Lesson">
        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <div className="space-y-2">
            <Label htmlFor="l-title">Title</Label>
            <Input id="l-title" value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l-points">Points</Label>
            <Input id="l-points" type="number" min={0} max={1000} value={form.points} onChange={(e) => set("points", Number(e.target.value))} />
          </div>
        </div>
        <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
          <Toggle label="Published" hint="Students can open this lesson" checked={form.isPublished} onChange={(v) => toggle({ isPublished: v })} />
          <Toggle label="Free" hint="Open without PRO" checked={form.isFree} onChange={(v) => toggle({ isFree: v })} />
        </div>
      </Panel>

      <Panel title="Video">
        <VideoField value={form.videoUrl} onChange={(url) => set("videoUrl", url)} />
        <div className="space-y-2 border-t pt-4">
          <Label htmlFor="l-yt">Or a YouTube link (website only; the mobile app plays only uploaded videos)</Label>
          <Input id="l-yt" value={form.youTubeVideoUrl} onChange={(e) => set("youTubeVideoUrl", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
        </div>
      </Panel>

      <div className="space-y-2">
        <h2 className="font-heading text-lg font-semibold">Content</h2>
        <RichEditor value={lesson.content} onChange={(json) => set("content", json)} />
      </div>

      <div className="flex justify-end">
        <DeleteButton
          what="lesson"
          warning={`Deletes "${saved.title}" and the students' progress in it. This can't be undone.`}
          onDelete={async () => {
            if (await act(deleteLesson(lesson.id), "Lesson deleted")) router.push(`/admin/chapters/${chapter.id}`)
          }}
        />
      </div>

      <SaveBar dirty={dirty} saving={saving} onSave={save} />
    </div>
  )
}
