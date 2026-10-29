import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCourseOutline } from "@/lib/course-outline"
import CoursePage from "./_components/course-page"

export const metadata: Metadata = {
  title: "SAT Math course · SAT Learner",
  description: "Video lessons, chapter quizzes and full practice exams for SAT Math. Free lessons in every chapter.",
}

// Marketing page for the SAT course; learning happens on the platform (app.satlearner.com).
// Static and rebuilt hourly from the cached outline, so it opens instantly. Logged-in
// students are sent to the platform by middleware, so nothing here depends on the user.
export const revalidate = 3600

const SatCoursePage = async () => {
  const course = await getCourseOutline()
  // A missing course must not redirect to itself (that loops)
  if (!course) notFound()

  return <CoursePage course={course} />
}

export default SatCoursePage
