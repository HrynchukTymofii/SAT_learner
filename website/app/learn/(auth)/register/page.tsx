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
import { registerUser } from "@/lib/registerUser"

export default function RegisterPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await registerUser({
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
      })

      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.ok) {
        router.push("/")
        router.refresh()
      } else {
        setError("Your account was created, but logging in failed. Try logging in.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Could not create the account. Maybe this email is already registered?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthFrame title="Create your account" subtitle="Free to start. Your progress syncs with the app.">
      <AuthProviders isRegister />
      <OrDivider />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="font-bold">First name</Label>
            <Input id="firstName" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="font-bold">Last name</Label>
            <Input id="lastName" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="font-bold">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="font-bold">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" minLength={4} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="font-bold">Repeat password</Label>
          <Input id="confirmPassword" type="password" autoComplete="new-password" minLength={4} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
        {error && <p role="alert" className="rounded-2xl bg-rose px-4 py-3 text-sm font-semibold">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm font-semibold text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </AuthFrame>
  )
}
