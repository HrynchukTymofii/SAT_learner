import { redirect } from "next/navigation"
import { auth } from "@/lib/getAuth"
import { getCoursesWithProgress } from "@/lib/course-progress"
import { PlatformHome } from "@/components/platform/platform-home"

// Platform home: your courses, then practice
export default async function PlatformHomePage() {
  const { userId, user } = await auth()
  // The layout checks this too, but layout and page render at the same time
  if (!userId) redirect("/login")
  const courses = await getCoursesWithProgress(userId)

  return <PlatformHome firstName={user?.name?.split(" ")[0]} courses={courses} />
}
