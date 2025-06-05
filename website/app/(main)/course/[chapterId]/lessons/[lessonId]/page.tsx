import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";
import LessonContent from "./_components/lesson_page";

const LessonPage = async ({ params }: { params: Promise<{ chapterId: string; lessonId: string }> }) => {
    const courseId = process.env.COURSE_ID || "";
    const {  chapterId, lessonId } = await params;

    const lesson = await db.lesson.findUnique({
        where: {
          id: lessonId,
        }, 
        include: {
            muxData: true
        }
    });

    // const sections = await db.lessonSection.findMany({
    //     where: {
    //       lessonId: lessonId,
    //     },
    //     orderBy: {
    //         position: 'asc'
    //     }
    // });

    if (!lesson) {
        toast.error("Something went wrong!")
        return redirect(`/courses/${courseId}/chapters/${chapterId}`);
    }

    return <LessonContent lesson={lesson} lessonId={lessonId} chapterId={chapterId} courseId={courseId}/>
}

export default LessonPage