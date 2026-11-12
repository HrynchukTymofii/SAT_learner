"use client"

import * as React from "react"
import Link from "next/link"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { ChevronLeft, GripVertical, Loader2, Save, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function Back({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-semibold">
      <ChevronLeft className="size-4" /> {children}
    </Link>
  )
}

export function Panel({ title, action, children, className }: { title?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("bg-card space-y-4 rounded-3xl border p-5", className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="font-heading text-lg font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function StatusBadge({ published, free }: { published: boolean; free?: boolean }) {
  return (
    <span className="flex shrink-0 gap-1.5">
      {free && <span className="bg-butter rounded-full px-2 py-0.5 text-[11px] font-bold text-[#0B0A0F]">Free</span>}
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-bold",
          published ? "bg-mint text-[#0B0A0F]" : "bg-muted text-muted-foreground",
        )}
      >
        {published ? "Published" : "Draft"}
      </span>
    </span>
  )
}

/**
 * A labelled on/off switch that saves right away. It flips at once and shows a spinner while
 * saving; if onChange resolves to a falsy value (the save failed) it flips back.
 */
export function Toggle({ label, hint, checked, onChange, disabled }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => unknown; disabled?: boolean }) {
  const [value, setValue] = React.useState(checked)
  const [pending, setPending] = React.useState(false)
  React.useEffect(() => setValue(checked), [checked])

  const flip = async () => {
    const next = !value
    setValue(next)
    setPending(true)
    try {
      if (!(await onChange(next))) setValue(!next)
    } catch {
      setValue(!next)
    } finally {
      setPending(false)
    }
  }

  return (
    <label className={cn("flex cursor-pointer items-start gap-3", (disabled || pending) && "cursor-not-allowed", disabled && "opacity-60")}>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-busy={pending}
        disabled={disabled || pending}
        onClick={flip}
        className={cn("relative mt-0.5 h-6 w-10 shrink-0 rounded-full transition-colors", value ? "bg-primary" : "bg-muted-foreground/30")}
      >
        <span className={cn("bg-background absolute top-0.5 grid size-5 place-items-center rounded-full shadow transition-all", value ? "left-[18px]" : "left-0.5")}>
          {pending && <Loader2 className="text-muted-foreground size-3.5 animate-spin" />}
        </span>
      </button>
      <span>
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          {label}
          {pending && <span className="text-muted-foreground text-xs font-medium">Saving…</span>}
        </span>
        {hint && <span className="text-muted-foreground block text-xs">{hint}</span>}
      </span>
    </label>
  )
}

/** Calls a server action, shows a toast on error, returns the data or undefined. */
export async function act<T>(p: Promise<{ ok: true; data: T } | { ok: false; error: string }>, success?: string) {
  const r = await p
  if (!r.ok) {
    toast.error(r.error)
    return undefined
  }
  if (success) toast.success(success)
  return r.data ?? (true as unknown as T)
}

/** Drag-to-reorder list. Calls onReorder with the new order (items are moved optimistically). */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  render,
  droppableId = "list",
  handleAlign = "center",
}: {
  items: T[]
  onReorder: (items: T[]) => void
  render: (item: T, index: number) => React.ReactNode
  droppableId?: string
  /** "top" keeps the grip next to the first row when items expand */
  handleAlign?: "center" | "top"
}) {
  const [list, setList] = React.useState(items)
  React.useEffect(() => setList(items), [items])

  const onDragEnd = (r: DropResult) => {
    if (!r.destination || r.destination.index === r.source.index) return
    const next = [...list]
    const [moved] = next.splice(r.source.index, 1)
    next.splice(r.destination.index, 0, moved)
    setList(next)
    onReorder(next)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId}>
        {(drop) => (
          <ul ref={drop.innerRef} {...drop.droppableProps} className="space-y-2">
            {list.map((item, i) => (
              <Draggable key={item.id} draggableId={item.id} index={i}>
                {(drag, snap) => (
                  <li
                    ref={drag.innerRef}
                    {...drag.draggableProps}
                    className={cn("bg-background flex gap-2 rounded-2xl border pr-3", handleAlign === "center" && "items-center", snap.isDragging && "shadow-lg")}
                  >
                    <span
                      {...drag.dragHandleProps}
                      className={cn(
                        "text-muted-foreground hover:text-foreground flex self-stretch pl-3",
                        handleAlign === "center" ? "items-center" : "items-start pt-[22px]",
                      )}
                      aria-label="Drag to reorder"
                    >
                      <GripVertical className="size-4" />
                    </span>
                    {render(item, i)}
                  </li>
                )}
              </Draggable>
            ))}
            {drop.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  )
}

/** Small form: text input + button, used for "Add chapter", "Add lesson", ... */
export function AddForm({ placeholder, button, onAdd }: { placeholder: string; button: string; onAdd: (title: string) => Promise<unknown> }) {
  const [title, setTitle] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!title.trim()) return
        setBusy(true)
        const ok = await onAdd(title.trim())
        setBusy(false)
        if (ok) setTitle("")
      }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        maxLength={200}
        className="border-input bg-background h-10 min-w-0 flex-1 rounded-full border px-4 text-sm"
      />
      <button type="submit" disabled={busy || !title.trim()} className="bg-primary text-primary-foreground h-10 shrink-0 rounded-full px-4 text-sm font-semibold disabled:opacity-50">
        {busy ? "Adding…" : button}
      </button>
    </form>
  )
}

/** Red "Delete" button that asks first. */
export function DeleteButton({ what, warning, onDelete }: { what: string; warning?: string; onDelete: () => Promise<unknown> }) {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  return (
    <>
      <Button type="button" variant="outline" size="sm" className="text-destructive" onClick={() => setOpen(true)}>
        <Trash2 className="size-4" /> Delete {what}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this {what}?</DialogTitle>
            <DialogDescription>{warning || "This can't be undone."}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                await onDelete()
                setBusy(false)
                setOpen(false)
              }}
            >
              {busy ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/** Warn before closing the tab with unsaved changes. */
export function useUnsavedWarning(dirty: boolean) {
  React.useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", h)
    return () => window.removeEventListener("beforeunload", h)
  }, [dirty])
}

/** Ctrl/Cmd + S runs save. */
export function useSaveShortcut(save: () => void) {
  const ref = React.useRef(save)
  ref.current = save
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault()
        ref.current()
      }
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [])
}

/** Sticky bar at the bottom while there are unsaved changes. */
export function SaveBar({ dirty, saving, onSave }: { dirty: boolean; saving: boolean; onSave: () => void }) {
  if (!dirty && !saving) return null
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="bg-foreground text-background flex items-center gap-4 rounded-full py-2 pr-2 pl-5 shadow-xl">
        <span className="text-sm font-semibold">{saving ? "Saving…" : "Unsaved changes"}</span>
        <Button size="sm" variant="secondary" onClick={onSave} disabled={saving}>
          <Save className="size-4" /> Save <span className="text-muted-foreground hidden text-xs sm:inline">Ctrl+S</span>
        </Button>
      </div>
    </div>
  )
}
