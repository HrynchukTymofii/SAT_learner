import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, quizId, answers } = await req.json();

  if (!userId || !quizId || !answers) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  try {
    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    let totalScore = 0;

    const questionResults = quiz.questions.map((question) => {
      const userAnswers = answers[question.id] || [];
      const correctAnswers = question.answers as string[];
      const isCorrect =
        correctAnswers.every((a) => userAnswers.includes(a)) &&
        userAnswers.length === correctAnswers.length;

      if (isCorrect) {
        totalScore += question.points;
      }

      return { questionId: question.id, isCorrect };
    });

    const quizResult = await db.quizResult.create({
      data: {
        userId,
        quizId,
        score: totalScore,
        answers: answers,
        completed: totalScore !== 0,
        attemptCount: 1,
      },
    });

    return NextResponse.json({ totalScore, questionResults, quizResult });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
    const { userId, quizId, answers } = await req.json();

    if (!userId || !quizId || !answers) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    try {
      const quiz = await db.quiz.findUnique({
        where: { id: quizId },
        include: { questions: true },
      });

      if (!quiz) {
        return new NextResponse("Quiz not found", { status: 404 });
      }

      let totalScore = 0;

      const questionResults = quiz.questions.map((question) => {
        const userAnswers = answers[question.id] || [];
        const correctAnswers = question.answers as string[];
        const isCorrect =
          correctAnswers.every((a) => userAnswers.includes(a)) &&
          userAnswers.length === correctAnswers.length;

        if (isCorrect) {
          totalScore += question.points;
        }

        return { questionId: question.id, isCorrect };
      });

      const quizResult = await db.quizResult.update({
        where: { userId_quizId: { userId, quizId } },
        data: {
          score: totalScore,
          answers: answers,
          completed: totalScore > 0,
          attemptCount: { increment: 1 }, 
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ totalScore, questionResults, quizResult });
    } catch (error) {
      console.error("Error retrying quiz:", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
}

