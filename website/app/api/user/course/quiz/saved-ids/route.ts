import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.userId) {
      return NextResponse.json({ savedIds: [] })
    }

    const savedQuestions = await db.userQuizQuestion.findMany({
      where: {
        userId: session.user.userId,
        saved: true,
      },
      select: {
        questionId: true,
      },
    })

    const savedIds = savedQuestions.map((sq) => sq.questionId)

    return NextResponse.json({ savedIds })
  } catch (error) {
    console.error("Error fetching saved question IDs:", error)
    return NextResponse.json({ savedIds: [] })
  }
}
