import { db } from "@/lib/db";
import ChapterSidebar from "./_components/chapterSidebar"
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/getAuth";
import { platformCourseIds } from "@/lib/course-progress";

const CourseLayout = async ({ children, params }: { children: React.ReactNode; params: Promise<{ chapterId: string }> }) => {
  const { chapterId } = await params;
  const { userId } = await auth();

  if(!userId){
      return redirect("/login");
  }

  // The chapter decides the course, so every course works without a COURSE_ID setting
  const chapter = await db.chapter.findUnique({ where: { id: chapterId }, select: { courseId: true } });
  if (!chapter || !platformCourseIds().includes(chapter.courseId)) notFound();

  // Only what the outline shows: no lesson content, no questions
  const course = await db.course.findUnique({
    where: { id: chapter.courseId },
    select: {
      id: true,
      title: true,
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            select: { id: true, title: true, position: true, progress: { where: { userId }, select: { completed: true } } },
          },
          quizzes: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            select: { id: true, title: true, position: true, maxScore: true, results: { where: { userId }, select: { score: true } } },
          },
        },
      },
    },
  });

  // Not a redirect to /course: /course 404s on the same missing course
  if(!course) notFound();

  return (
    <>
      {/* The lesson is centred on the whole panel, on its own: side columns are equal, and the right one
          never gets narrower than the docked outline, so on smaller screens the lesson slides left instead. */}
      <div className="w-full xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,1024px)_minmax(344px,1fr)]">
        <div className="min-w-0 xl:col-start-2">{children}</div>
      </div>
      <ChapterSidebar course={course} />
    </>
  )
}

export default CourseLayout
