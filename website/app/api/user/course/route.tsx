import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET!;
const COURSE_ID = process.env.COURSE_ID!;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  let userId: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      userId = decoded.id;
    } catch (error) {
      console.error("❌ Invalid or expired token:", error);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
  }

  try {
    const course = await db.course.findUnique({
      where: { id: COURSE_ID },
      include: {
        chapters: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          include: {
            lessons: userId
              ? {
                  where: { isPublished: true },
                  orderBy: { position: "asc" },
                  include: { progress: { where: { userId } } },
                }
              : { where: { isPublished: true }, orderBy: { position: "asc" } },
            quizzes: userId
              ? {
                  where: { isPublished: true },
                  orderBy: { position: "asc" },
                  include: { results: { where: { userId } } },
                }
              : { where: { isPublished: true }, orderBy: { position: "asc" } },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check enrollment if logged in
    let isEnrolled = false;
    if (userId) {
      const enrollment = await db.courseSubscription.findFirst({
        where: { userId, courseId: COURSE_ID },
      });
      isEnrolled = !!enrollment;
    }

    // Flatten the response
    return NextResponse.json({ ...course, isEnrolled, userId });
  } catch (error) {
    console.error("❌ Error fetching course:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
