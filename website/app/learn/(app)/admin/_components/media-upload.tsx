"use client"

import * as React from "react"
import { ImageIcon, Upload, Video, X } from "lucide-react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { uploadToR2, type UploadKind } from "@/lib/upload-client"

/** Upload one file to R2 and get its URL back. Shows progress and lets you cancel. */
function useUpload(kind: UploadKind, onUploaded: (url: string) => void) {
  const [progress, setProgress] = React.useState<number | null>(null)
  const abort = React.useRef<AbortController | null>(null)

  const start = async (file: File) => {
    abort.current = new AbortController()
    setProgress(0)
    try {
      const url = await uploadToR2(file, kind, setProgress, abort.current.signal)
      onUploaded(url)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setProgress(null)
      abort.current = null
    }
  }
  return { progress, start, cancel: () => abort.current?.abort() }
}

function PickButton({ accept, label, onFile, disabled }: { accept: string; label: string; onFile: (f: File) => void; disabled?: boolean }) {
  const input = React.useRef<HTMLInputElement>(null)
  return (
    <>
      <input
        ref={input}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          e.target.value = ""
          if (f) onFile(f)
        }}
      />
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => input.current?.click()}>
        <Upload className="size-4" /> {label}
      </Button>
    </>
  )
}

function ProgressBar({ value, onCancel }: { value: number; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
        <div className="bg-primary h-full transition-[width]" style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-bold tabular-nums">{value}%</span>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
    </div>
  )
}

export function VideoField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const { progress, start, cancel } = useUpload("video", onChange)
  return (
    <div className="space-y-3">
      {value ? (
        <div className="space-y-2">
          <video src={value} controls preload="metadata" className="aspect-video w-full rounded-2xl bg-black" />
          <div className="flex flex-wrap gap-2">
            <PickButton accept="video/mp4,video/quicktime,video/webm" label="Replace video" onFile={start} disabled={progress !== null} />
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              <X className="size-4" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-muted/50 flex flex-col items-center gap-2 rounded-2xl border border-dashed p-6 text-center">
          <Video className="text-muted-foreground size-8" />
          <p className="text-muted-foreground text-sm">MP4 works everywhere (website, iPhone, Android). Up to 2 GB.</p>
          <PickButton accept="video/mp4,video/quicktime,video/webm" label="Upload video" onFile={start} disabled={progress !== null} />
        </div>
      )}
      {progress !== null && <ProgressBar value={progress} onCancel={cancel} />}
    </div>
  )
}

export function ImageField({ value, onChange, height }: { value: string; onChange: (url: string) => void; height?: number }) {
  const { progress, start, cancel } = useUpload("image", onChange)
  return (
    <div className="space-y-3">
      {value ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" style={{ height: height || 200 }} className="bg-muted max-w-full rounded-xl border object-contain" />
          <div className="flex flex-wrap gap-2">
            <PickButton accept="image/*" label="Replace" onFile={start} disabled={progress !== null} />
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              <X className="size-4" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <ImageIcon className="text-muted-foreground size-5" />
          <PickButton accept="image/*" label="Upload image" onFile={start} disabled={progress !== null} />
        </div>
      )}
      {progress !== null && <ProgressBar value={progress} onCancel={cancel} />}
    </div>
  )
}
