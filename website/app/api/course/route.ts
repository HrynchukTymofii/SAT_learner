import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const COURSE_ID = process.env.COURSE_ID || "";

export async function GET(
  req: NextRequest,
) {
  try {
    const chapters = await db.chapter.findMany({
      where: {
        courseId: COURSE_ID,
        isPublished: true,
      },
      orderBy: { position: "asc" },
      select: {
        id: true,
        title: true,
        lessons: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          select: {
            id: true,
            title: true,
            youTubeVideoUrl: true
          },
        },
        quizzes: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, chapters });
  } catch (err) {
    console.error("❌ Error fetching course data:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course data" },
      { status: 500 }
    );
  }
}
