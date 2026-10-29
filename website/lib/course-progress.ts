import { db } from "@/lib/db";

// Courses shown on the platform, in this order. One PRO covers all of them.
// Add a course by adding its id to PLATFORM_COURSE_IDS (comma separated).
export function platformCourseIds(): string[] {
  return (process.env.PLATFORM_COURSE_IDS || process.env.COURSE_ID || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export interface CourseItem {
  id: string;
  title: string;
  type: "lesson" | "quiz";
  url: string;
  done: boolean;
}

export interface CourseWithProgress {
  id: string;
  title: string;
  description: string | null;
  chapters: { id: string; title: string; items: CourseItem[] }[];
  total: number;
  done: number;
  // First unfinished lesson or quiz; null when the course is finished
  next: (CourseItem & { chapterTitle: string }) | null;
}

export async function getCoursesWithProgress(
  userId: string,
  ids: string[] = platformCourseIds()
): Promise<CourseWithProgress[]> {
  const courses = await db.course.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      description: true,
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          lessons: {
            where: { isPublished: true },
            select: { id: true, title: true, position: true, progress: { where: { userId }, select: { completed: true } } },
          },
          quizzes: {
            where: { isPublished: true },
            select: { id: true, title: true, position: true, results: { where: { userId }, select: { completed: true } } },
          },
        },
      },
    },
  });

  return ids
    .map((id) => courses.find((c) => c.id === id))
    .filter((c): c is (typeof courses)[number] => !!c)
    .map((course) => {
      const chapters = course.chapters.map((chapter) => {
        // Lessons and quizzes share one position order inside a chapter
        const items = [
          ...chapter.lessons.map((l) => ({ ...l, type: "lesson" as const, done: !!l.progress[0]?.completed })),
          ...chapter.quizzes.map((q) => ({ ...q, type: "quiz" as const, done: !!q.results[0]?.completed })),
        ]
          .sort((a, b) => a.position - b.position)
          .map(({ id, title, type, done }) => ({
            id,
            title,
            type,
            done,
            url: `/course/${chapter.id}/${type === "lesson" ? "lessons" : "quizzes"}/${id}`,
          }));
        return { id: chapter.id, title: chapter.title, items };
      });

      const all = chapters.flatMap((ch) => ch.items.map((item) => ({ ...item, chapterTitle: ch.title })));
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        chapters,
        total: all.length,
        done: all.filter((i) => i.done).length,
        next: all.find((i) => !i.done) ?? null,
      };
    });
}
