import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"

/** Questions are edited inside their quiz now; old links open the quiz with this question expanded. */
export default async function AdminQuestionPage({ params }: { params: Promise<{ questionId: string }> }) {
  const { questionId } = await params
  const q = await db.quizQuestion.findUnique({ where: { id: questionId }, select: { quizId: true } })
  if (!q) notFound()
  redirect(`/admin/quizzes/${q.quizId}?q=${questionId}`)
}
