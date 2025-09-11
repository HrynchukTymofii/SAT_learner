import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ quizId: string }> }) {
  try {
    const { quizId } = await params;

    if (!quizId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    return NextResponse.json({ success: true, data: quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


export async function POST(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;

    const { userId } = await req.json();
  
    if (!userId || !quizId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
  
      const quizResult = await db.quizResult.findFirst({
        where: { userId, quizId: quizId },
        orderBy: { updatedAt: "desc" },
      });
  
      if (!quizResult) {
        return new NextResponse("No quiz result found", { status: 404 });
      }
  
      return NextResponse.json(quizResult);
    } catch (error) {
      console.error("Error fetching quiz result:", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
}
  