"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type Row = { id: string; title: string; body: string; audience: string; pushCount: number; reads: number; createdAt: string }

const AUDIENCE_LABEL: Record<string, string> = { all: "Everyone", pro: "PRO users", free: "Free users", user: "One user" }

export default function NotificationsAdmin({ phones, history }: { phones: number; history: Row[] }) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [url, setUrl] = useState("")
  const [audience, setAudience] = useState("all")
  const [email, setEmail] = useState("")
  const [push, setPush] = useState(true)
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)
    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, url: url || undefined, audience, email: audience === "user" ? email : undefined, push }),
    })
    const json = await res.json().catch(() => ({}))
    setSending(false)
    if (!res.ok) return setStatus(json.error || "Couldn't send")
    setStatus(`Sent. ${json.notification.pushCount} push${json.notification.pushCount === 1 ? "" : "es"} delivered to Expo.`)
    setTitle("")
    setBody("")
    setUrl("")
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 md:p-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Shows up in the app inbox (the bell on Home) and, if push is on, on the phone. {phones} phone{phones === 1 ? "" : "s"} registered.
        </p>
      </div>

      <form onSubmit={send} className="bg-card space-y-4 rounded-3xl border p-5">
        <div className="space-y-2">
          <Label htmlFor="n-title">Title</Label>
          <Input id="n-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required placeholder="New practice exam is live" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="n-body">Message</Label>
          <Textarea id="n-body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={1000} required rows={3} placeholder="Full SAT Math section #4 is ready. 44 questions, 70 minutes." />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="n-aud">Send to</Label>
            <select id="n-aud" value={audience} onChange={(e) => setAudience(e.target.value)} className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm">
              {Object.entries(AUDIENCE_LABEL).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="n-url">Opens in the app (optional)</Label>
            <Input id="n-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/tests/exams" pattern="/.*" />
          </div>
        </div>
        {audience === "user" && (
          <div className="space-y-2">
            <Label htmlFor="n-email">User email</Label>
            <Input id="n-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        )}
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} className="size-4" />
          Also send as a push notification
        </label>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={sending} className="rounded-full">
            <Send className="size-4" /> {sending ? "Sending…" : "Send"}
          </Button>
          {status && <p className="text-muted-foreground text-sm">{status}</p>}
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="font-heading text-xl font-semibold">Sent</h2>
        {history.length === 0 && <p className="text-muted-foreground text-sm">Nothing sent yet.</p>}
        {history.map((n) => (
          <div key={n.id} className="bg-card flex gap-3 rounded-2xl border p-4">
            <div className="bg-lav grid size-10 shrink-0 place-items-center rounded-full text-[#0B0A0F]"><Bell className="size-4" /></div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{n.title}</p>
              <p className="text-muted-foreground text-sm">{n.body}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {AUDIENCE_LABEL[n.audience] ?? n.audience} · {new Date(n.createdAt).toLocaleString()} · {n.pushCount} pushed · {n.reads} read
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
