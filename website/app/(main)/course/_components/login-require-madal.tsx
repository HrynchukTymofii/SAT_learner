"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogIn, Sparkles } from "lucide-react"
import { LoginModal } from "@/components/login-modal"

interface LoginFirstModalProps {
  isOpen: boolean
  onClose: () => void
}

export const LoginFirstModal = ({ isOpen, onClose }: LoginFirstModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center space-y-4 bg-card border-border rounded-3xl p-8">
        {/* Decorative gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-t-3xl" />

        <DialogHeader className="space-y-4">
          <div className="mx-auto p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl w-fit">
            <Sparkles className="h-8 w-8 text-purple-500 dark:text-purple-400" />
          </div>
          <DialogTitle className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Hold up! One quick thing...
          </DialogTitle>
        </DialogHeader>

        <p className="text-base text-muted-foreground leading-relaxed">
          Before you dive into SAT greatness, <span className="text-blue-600 dark:text-blue-400 font-semibold">log in or sign up</span> to track your score, crush your goals, and unlock your full potential.
          <br />
          <span className="inline-flex items-center gap-1 mt-2">
            It's <span className="font-bold text-emerald-600 dark:text-emerald-400">100% free</span> — no excuses!
          </span>
        </p>

        <LoginModal>
          <Button className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105">
            <LogIn className="h-4 w-4 mr-2" />
            Let's Get Started
          </Button>
        </LoginModal>
      </DialogContent>
    </Dialog>
  )
}
