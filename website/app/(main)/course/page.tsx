import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import CoursePage from "./_components/course-page"

const CourseIdPage = async () => {
  const courseId = process.env.COURSE_ID;
  // Mock userId for demonstration - in a real app, this would come from auth
  const userId = "user"

  const course = await db.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            include: { progress: { where: { userId } } },
          },
          quizzes: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            include: { results: { where: { userId } } },
          },
        },
      },
    },
  })

  const attachments = await db.attachment.findMany({
    where: {
      courseId: courseId,
    },
  })

  // Check if user is enrolled
  const enrollment = await db.courseSubscription.findFirst({
    where: {
      userId,
      courseId,
    },
  })

  const isEnrolled = true
  //const isEnrolled = !!enrollment

  if (!course) {
    return redirect("/courses")
  }

  return <CoursePage course={course} attachments={attachments} isEnrolled={isEnrolled} userId={userId} />
}

export default CourseIdPage

/*import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import CoursePage from "./_components/course-page";

const CourseIdPage = async () => {
  const courseId = process.env.COURSE_ID || "";
  const course = await db.course.findUnique({
    where: {
      id: courseId,
    }, 
    include: {
      chapters: {
        where: {
          isPublished: true
        },
        include: {
          lessons: {
            where: {
              isPublished: true,
            },
            orderBy: {
              position: "asc",
            },
          },
          quizzes: {
            where: {
              isPublished: true,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      }
    }
  });
  const attachments = await db.attachment.findMany({
    where: {
      courseId: courseId,
    }
  })

  if (!course) {
    return redirect("/courses");
  }

  return (
   <CoursePage course={course} attachments={attachments}/>
  )
}

export default CourseIdPage;
*/