import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, GraduationCap, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { AuthProviders } from "@/components/auth-providers"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="outline" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Header */}
        <Card className="shadow-xl border-0 bg-white mb-8">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-white/20 rounded-lg mb-4">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-green-100">Sign in to continue your SAT preparation journey</p>
            </div>
          </div>
        </Card>

        {/* Login Form */}
        <Card className="shadow-lg border-0 bg-white py-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Social Login */}
            <AuthProviders />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="email" type="email" placeholder="Enter your email" className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="password" type="password" placeholder="Enter your password" className="pl-10" required />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                Sign In
              </Button>
            </form>

            <div className="text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 underline font-medium">
                Sign up here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
