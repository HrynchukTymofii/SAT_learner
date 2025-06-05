import { db } from "@/lib/db";
import { NextResponse } from "next/server";


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
  