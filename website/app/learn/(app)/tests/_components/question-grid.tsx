"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Grid3X3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  position: number
}

interface QuestionGridProps {
  isOpen: boolean
  onClose: () => void
  questions: Question[]
  answeredQuestions: Record<string, boolean>
  currentQuestionIndex: number
  onQuestionSelect: (index: number) => void
}

export const QuestionGrid = ({
  isOpen,
  onClose,
  questions,
  answeredQuestions,
  currentQuestionIndex,
  onQuestionSelect,
}: QuestionGridProps) => {
  const correctCount = Object.values(answeredQuestions).filter((correct) => correct).length
  const incorrectCount = Object.values(answeredQuestions).filter((correct) => !correct).length
  const answeredCount = Object.keys(answeredQuestions).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            All Questions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">{answeredCount}</div>
              <div className="text-xs text-muted-foreground">Answered</div>
            </div>
            <div className="text-center p-3 bg-mint rounded-lg">
              <div className="text-2xl font-bold text-success">{correctCount}</div>
              <div className="text-xs text-success">Correct</div>
            </div>
            <div className="text-center p-3 bg-rose rounded-lg">
              <div className="text-2xl font-bold text-destructive">{incorrectCount}</div>
              <div className="text-xs text-destructive">Incorrect</div>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const isAnswered = question.id in answeredQuestions
              const isCorrect = answeredQuestions[question.id]
              const isCurrent = index === currentQuestionIndex

              return (
                <Button
                  key={question.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onQuestionSelect(index)
                    onClose()
                  }}
                  className={cn(
                    "relative w-12 h-12 p-0 font-semibold transition-all",
                    isCurrent && "ring-2 ring-primary bg-primary/10 border-primary",
                    isAnswered && isCorrect && "bg-mint border-success/40 text-success",
                    isAnswered && !isCorrect && "bg-rose border-destructive/40 text-destructive",
                    !isAnswered && !isCurrent && "bg-card"
                  )}
                >
                  {index + 1}
                  {isAnswered && (
                    <div className="absolute -top-1 -right-1">
                      {isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-success fill-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive fill-destructive" />
                      )}
                    </div>
                  )}
                </Button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary/20 border-2 border-primary rounded" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-mint border-2 border-success/40 rounded" />
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-rose border-2 border-destructive/40 rounded" />
              <span>Incorrect</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-card border-2 border-border rounded" />
              <span>Unanswered</span>
            </div>
          </div>

          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
