import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import type { QuestionInput, QuestionType } from "../../actions"
import { QuizEditor } from "./quiz-editor"

export const dynamic = "force-dynamic"

const strings = (v: unknown) => (Array.isArray(v) ? v.map(String) : [])

/** Old rows have no questionType; work it out the way Fibipals did. */
function typeOf(q: { questionType: string | null; options: string[]; answers: string[] }): QuestionType {
  if (q.questionType && ["single_choice", "multiple_choice", "true_false", "open_ended"].includes(q.questionType)) {
    return q.questionType as QuestionType
  }
  if (q.options.length === 2 && q.options.includes("True") && q.options.includes("False")) return "true_false"
  if (q.options.length === 0) return "open_ended"
  return q.answers.length > 1 ? "multiple_choice" : "single_choice"
}

export default async function AdminQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ quizId: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { quizId } = await params
  const { q: openId } = await searchParams
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      title: true,
      description: true,
      isPublished: true,
      isFree: true,
      maxScore: true,
      chapter: { select: { id: true, title: true } },
      questions: { orderBy: { position: "asc" } },
    },
  })
  if (!quiz) notFound()

  return (
    <QuizEditor
      quiz={{ id: quiz.id, title: quiz.title, description: quiz.description ?? "", isPublished: quiz.isPublished, isFree: quiz.isFree, maxScore: quiz.maxScore }}
      chapter={quiz.chapter}
      openId={openId}
      questions={quiz.questions.map((q) => {
        const options = strings(q.options)
        const answers = strings(q.answers)
        const data: QuestionInput = {
          question: q.question,
          questionType: typeOf({ questionType: q.questionType, options, answers }),
          options: options.length ? options : ["", "", "", ""],
          answers: answers.length ? answers : q.openEndedAnswer ? [q.openEndedAnswer] : [],
          hint: q.hint ?? "",
          note: q.note ?? "",
          questionImageUrl: q.questionImageUrl ?? "",
          hintImageUrl: q.hintImageUrl ?? "",
          imageHeight: q.imageHeight,
          points: q.points,
        }
        return { id: q.id, data }
      })}
    />
  )
}
