import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/getAuth";
import { requireAuth } from "@/lib/expo-auth";

async function getAuthenticatedUserId(req: NextRequest): Promise<string | null> {
  const session = await auth();
  if (session?.user?.userId) return session.user.userId;
  const authResult = requireAuth(req);
  if (!(authResult instanceof NextResponse)) {
    return authResult.userId;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const authUserId = await getAuthenticatedUserId(req);
  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { lessonId } = body;
  const userId = authUserId;

  if (!lessonId) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  try {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return new NextResponse("lesson not found", { status: 404 });
    }

    const oldLessonProgress = await db.lessonProgress.findFirst({
      where: {
        userId: userId,
        lessonId: lessonId
      }
    });

    if (!oldLessonProgress) {
      const lessonProgress = await db.lessonProgress.create({
        data: {
          userId,
          lessonId,
          completed: true
        },
      });

      return NextResponse.json(lessonProgress);
    }

    return NextResponse.json(oldLessonProgress);
  } catch (error) {
    console.error("Error submitting lesson:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const authUserId = await getAuthenticatedUserId(req);
  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await req.json();
  const userId = authUserId;

  if (!lessonId) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  try {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return new NextResponse("lesson not found", { status: 404 });
    }

    const lessonProgress = await db.lessonProgress.update({
      where: { userId_lessonId: { userId, lessonId } },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(lessonProgress);
  } catch (error) {
    console.error("Error retrying lesson:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
