import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import CoursePage from "./_components/course-page"
import { auth } from "@/lib/getAuth";

const CourseIdPage = async () => {
  const courseId = process.env.COURSE_ID;
  const {userId} = await auth();

  let course

  if (userId) {
    // Logged-in: include progress/results
    course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        chapters: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { position: "asc" },
              include: {
                progress: { where: { userId } },
              },
            },
            quizzes: {
              where: { isPublished: true },
              orderBy: { position: "asc" },
              include: {
                results: { where: { userId } },
              },
            },
          },
        },
      },
    })
  } else {
    // Guest: exclude user-specific data
    course = await db.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        chapters: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { position: "asc" },
            },
            quizzes: {
              where: { isPublished: true },
              orderBy: { position: "asc" },
            },
          },
        },
      },
    })
  }

  if (!course) {
    return redirect("/courses")
  }

  let isEnrolled = false
  if (userId) {
    const enrollment = await db.courseSubscription.findFirst({
      where: { userId, courseId },
    })
    isEnrolled = !!enrollment
  }

  //const isEnrolled = false
  //const isEnrolled = !!enrollment

  return <CoursePage course={course} isEnrolled={isEnrolled} userId={userId} />
}

export default CourseIdPage