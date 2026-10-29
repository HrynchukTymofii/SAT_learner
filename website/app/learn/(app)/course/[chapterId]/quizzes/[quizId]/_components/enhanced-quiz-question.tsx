"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, BookOpen, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ReadOnlyEditor } from "@/components/tiptap-templates/simple/readonly-editor"

interface QuizQuestionProps {
  question: {
    id: string
    position: number
    question: string
    questionType: string | null
    questionImageUrl?: string | null
    options: string[]
    answers: string[]
    points: number
    note: string | null
  }
  selectedAnswers: string[]
  onAnswerSelect: (answers: string[]) => void
  isSubmitted: boolean
  results?: boolean[] | null
}

export const EnhancedQuizQuestion = ({
  question,
  selectedAnswers,
  onAnswerSelect,
  isSubmitted,
  results,
}: QuizQuestionProps) => {
  const [openEndedAnswer, setOpenEndedAnswer] = useState(selectedAnswers[0] || "")

  const handleMultipleChoice = (option: string) => {
    if (isSubmitted) return

    const newAnswers = selectedAnswers.includes(option)
      ? selectedAnswers.filter((ans) => ans !== option)
      : [...selectedAnswers, option]

    onAnswerSelect(newAnswers)
  }

  const handleSingleChoice = (option: string) => {
    if (isSubmitted) return
    onAnswerSelect([option])
  }

  const handleOpenEnded = (value: string) => {
    if (isSubmitted) return
    setOpenEndedAnswer(value)
    onAnswerSelect([value])
  }

  const handleTrueFalse = (value: string) => {
    if (isSubmitted) return
    onAnswerSelect([value])
  }

  const getQuestionTypeDisplay = () => {
    switch (question.questionType) {
      case "single_choice":
        return "Single Choice"
      case "multiple_choice":
        return "Multiple Choice"
      case "open_ended":
        return "Open Ended"
      case "true_false":
        return "True/False"
      default:
        return "Multiple Choice"
    }
  }

  const getQuestionTypeColor = () => {
    switch (question.questionType) {
      case "single_choice":
        return "bg-lav text-foreground border-transparent"
      case "multiple_choice":
        return "bg-mint text-foreground border-transparent"
      case "open_ended":
        return "bg-lav-2 text-foreground border-transparent"
      case "true_false":
        return "bg-butter text-foreground border-transparent"
      default:
        return "bg-muted text-foreground border-border"
    }
  }

  const renderQuestionContent = () => {
    switch (question.questionType) {
      case "single_choice":
        return (
          <RadioGroup
            value={selectedAnswers[0] || ""}
            onValueChange={handleSingleChoice}
            disabled={isSubmitted}
            className="space-y-3"
          >
            {question.options.map((option, index) => {
              let optionStyle = ""
              let showIcon = null

              if (isSubmitted && results) {
                const isCorrect = question.answers.includes(option)
                const isSelected = selectedAnswers.includes(option)

                if (isCorrect) {
                  optionStyle = "bg-mint border-transparent"
                  showIcon = <CheckCircle className="h-5 w-5 text-success" />
                } else if (isSelected) {
                  optionStyle = "bg-rose border-transparent"
                  showIcon = <XCircle className="h-5 w-5 text-destructive" />
                }
              }

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all",
                    selectedAnswers.includes(option) && !isSubmitted
                      ? "bg-lav border-transparent"
                      : "bg-muted border-border",
                    !isSubmitted && "hover:bg-muted cursor-pointer",
                    optionStyle,
                  )}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} className="h-5 w-5" />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-foreground">
                    {option}
                  </Label>
                  {showIcon}
                </div>
              )
            })}
          </RadioGroup>
        )

      case "multiple_choice":
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => {
              let optionStyle = ""
              let showIcon = null

              if (isSubmitted && results) {
                const isCorrect = question.answers.includes(option)
                const isSelected = selectedAnswers.includes(option)

                if (isCorrect) {
                  optionStyle = isSelected ? "bg-mint border-transparent" : "bg-mint border-transparent"
                  if (isCorrect) showIcon = <CheckCircle className="h-5 w-5 text-success" />
                } else if (isSelected) {
                  optionStyle = "bg-rose border-transparent"
                  showIcon = <XCircle className="h-5 w-5 text-destructive" />
                }
              }

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all",
                    selectedAnswers.includes(option) && !isSubmitted
                      ? "bg-lav border-transparent"
                      : "bg-muted border-border",
                    !isSubmitted && "hover:bg-muted cursor-pointer",
                    optionStyle,
                  )}
                  onClick={() => handleMultipleChoice(option)}
                >
                  <Checkbox
                    checked={selectedAnswers.includes(option)}
                    disabled={isSubmitted}
                    className="h-5 w-5"
                    onChange={() => handleMultipleChoice(option)}
                  />
                  <span className="flex-1 text-foreground">{option}</span>
                  {showIcon}
                </div>
              )
            })}
          </div>
        )

      case "true_false":
        return (
          <RadioGroup
            value={selectedAnswers[0] || ""}
            onValueChange={handleTrueFalse}
            disabled={isSubmitted}
            className="space-y-3"
          >
            {["True", "False"].map((option, index) => {
              let optionStyle = ""
              let showIcon = null

              if (isSubmitted && results) {
                const isCorrect = question.answers.includes(option)
                const isSelected = selectedAnswers.includes(option)

                if (isCorrect) {
                  optionStyle = "bg-mint border-transparent"
                  showIcon = <CheckCircle className="h-5 w-5 text-success" />
                } else if (isSelected) {
                  optionStyle = "bg-rose border-transparent"
                  showIcon = <XCircle className="h-5 w-5 text-destructive" />
                }
              }

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-lg border-2 transition-all",
                    selectedAnswers.includes(option) && !isSubmitted
                      ? "bg-lav border-transparent"
                      : "bg-muted border-border",
                    !isSubmitted && "hover:bg-muted cursor-pointer",
                    optionStyle,
                  )}
                >
                  <RadioGroupItem value={option} id={`tf-${index}`} className="h-5 w-5" />
                  <Label htmlFor={`tf-${index}`} className="flex-1 cursor-pointer text-foreground">
                    {option}
                  </Label>
                  {showIcon}
                </div>
              )
            })}
          </RadioGroup>
        )

      case "open_ended":
        return (
          <div className="space-y-4">
            <Textarea
              value={openEndedAnswer}
              onChange={(e) => handleOpenEnded(e.target.value)}
              disabled={isSubmitted}
              placeholder="Type your answer here..."
              className="min-h-32 resize-none"
            />
            {isSubmitted && (
              <Card className="bg-lav border-transparent">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-brand mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Sample Answer:</h4>
                      <div className="text-foreground text-sm space-y-1">
                        {question.answers.map((answer, index) => (
                          <p key={index}>• {answer}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return <div>Unsupported question type</div>
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardContent className="p-6 space-y-6">
        {/* Question Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-lav text-brand rounded-full font-semibold text-sm">
              {question.position + 1}
            </div>
            <Badge variant="outline" className={cn("text-xs", getQuestionTypeColor())}>
              {getQuestionTypeDisplay()}
            </Badge>
          </div>
          <Badge variant="outline" className="bg-butter text-foreground">
            {question.points} points
          </Badge>
        </div>

        {/* Question Text */}
        <div className="text-foreground text-lg leading-relaxed">
          <ReadOnlyEditor initialContent={question.question} />
        </div>

        {/* Question Image */}
        {question.questionImageUrl && (
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
              <Image
                src={question.questionImageUrl || "/placeholder.svg"}
                alt="Question illustration"
                fill
                className="object-contain bg-muted"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <span>Question illustration</span>
            </div>
          </div>
        )}

        {/* Question Content */}
        {renderQuestionContent()}

        {/* Explanation/Note */}
        {isSubmitted && question.note && (
          <Card className="bg-lav border-transparent">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-brand mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Explanation</h4>
                  <p className="text-foreground text-sm leading-relaxed">{question.note}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
