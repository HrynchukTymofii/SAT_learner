"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Lightbulb } from "lucide-react"
import { ReadOnlyEditor } from "@/components/tiptap-templates/simple/readonly-editor"
import Image from "next/image"

interface HintModalProps {
  isOpen: boolean
  onClose: () => void
  hint: string | null
  hintImageUrl?: string | null
}

export const HintModal = ({ isOpen, onClose, hint, hintImageUrl }: HintModalProps) => {
  if (!hint) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-warn fill-[#F2C94C]" />
            Hint
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <ReadOnlyEditor initialContent={hint} />
          </div>

          {hintImageUrl && (
            <div className="relative w-full">
              <Image
                src={hintImageUrl}
                alt="Hint illustration"
                width={400}
                height={300}
                className="rounded-lg border max-w-full h-auto"
              />
            </div>
          )}

          <Button onClick={onClose} className="w-full bg-primary hover:opacity-90">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
