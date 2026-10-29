"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthProviders } from "@/components/auth-providers"
import { AuthFrame, OrDivider } from "@/components/platform/auth-frame"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await signIn("credentials", { redirect: false, email, password })
    setLoading(false)
    if (res?.ok) {
      router.push("/")
      router.refresh()
    } else {
      setError("Wrong email or password.")
    }
  }

  return (
    <AuthFrame title="Welcome back" subtitle="Log in to pick up where you stopped.">
      <AuthProviders />
      <OrDivider />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="font-bold">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="font-bold">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p role="alert" className="rounded-2xl bg-rose px-4 py-3 text-sm font-semibold">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm font-semibold text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="font-bold text-brand hover:underline">
          Create a free account
        </Link>
      </p>
    </AuthFrame>
  )
}
