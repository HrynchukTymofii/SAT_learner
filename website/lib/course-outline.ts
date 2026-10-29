import { unstable_cache } from "next/cache"
import { db } from "@/lib/db"
import { platformCourseIds } from "@/lib/course-progress"

export interface OutlineItem {
  id: string
  title: string
  isFree: boolean
}

export interface CourseOutline {
  id: string
  title: string
  description: string | null
  courseVideoUrl: string | null
  imageUrl: string | null
  chapters: { id: string; title: string; lessons: OutlineItem[]; quizzes: OutlineItem[] }[]
  lessonCount: number
  quizCount: number
}

// Public outline of a course: chapters, lesson and quiz titles, which ones are free.
// Nothing user-specific, so it is cached for everyone (Next.js data cache, shared by all
// server instances) and refreshed hourly, or right away with revalidateTag("course-outline").
export const getCourseOutline = unstable_cache(
  async (courseId: string = platformCourseIds()[0]): Promise<CourseOutline | null> => {
    if (!courseId) return null
    const item = { where: { isPublished: true }, orderBy: { position: "asc" as const }, select: { id: true, title: true, isFree: true } }
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        courseVideoUrl: true,
        imageUrl: true,
        chapters: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          select: { id: true, title: true, lessons: item, quizzes: item },
        },
      },
    })
    if (!course) return null
    return {
      ...course,
      lessonCount: course.chapters.reduce((n, c) => n + c.lessons.length, 0),
      quizCount: course.chapters.reduce((n, c) => n + c.quizzes.length, 0),
    }
  },
  ["course-outline"],
  { revalidate: 3600, tags: ["course-outline"] }
)
