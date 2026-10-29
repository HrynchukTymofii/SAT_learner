import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import LessonContent from "./_components/lesson_page";

const LessonPage = async ({ params }: { params: Promise<{ chapterId: string; lessonId: string }> }) => {
    const { chapterId, lessonId } = await params;

    // Fetch lesson with chapter info
    const lesson = await db.lesson.findUnique({
        where: { id: lessonId },
        include: {
            chapter: {
                select: {
                    id: true,
                    title: true,
                    courseId: true,
                }
            }
        }
    });

    if (!lesson) {
        return redirect(`/course`);
    }
    const courseId = lesson.chapter.courseId;

    // Fetch all lessons and quizzes in this chapter for navigation
    const chapterContent = await db.chapter.findUnique({
        where: { id: chapterId },
        include: {
            lessons: {
                where: { isPublished: true },
                orderBy: { position: "asc" },
                select: { id: true, title: true, position: true }
            },
            quizzes: {
                where: { isPublished: true },
                orderBy: { position: "asc" },
                select: { id: true, title: true, position: true }
            }
        }
    });

    // Build navigation items (lessons then quizzes, sorted by position)
    const navItems: { id: string; title: string; type: "lesson" | "quiz"; position: number }[] = [];

    if (chapterContent) {
        chapterContent.lessons.forEach(l => {
            navItems.push({ id: l.id, title: l.title, type: "lesson", position: l.position });
        });
        chapterContent.quizzes.forEach(q => {
            navItems.push({ id: q.id, title: q.title, type: "quiz", position: q.position });
        });
    }

    // Sort by position
    navItems.sort((a, b) => a.position - b.position);

    // Find current index and prev/next
    const currentIndex = navItems.findIndex(item => item.id === lessonId && item.type === "lesson");
    const prevItem = currentIndex > 0 ? navItems[currentIndex - 1] : null;
    const nextItem = currentIndex < navItems.length - 1 ? navItems[currentIndex + 1] : null;

    return (
        <LessonContent
            lesson={lesson}
            lessonId={lessonId}
            chapterId={chapterId}
            courseId={courseId}
            chapterTitle={lesson.chapter?.title || "Chapter"}
            currentIndex={currentIndex}
            totalItems={navItems.length}
            prevItem={prevItem}
            nextItem={nextItem}
        />
    );
}

export default LessonPage