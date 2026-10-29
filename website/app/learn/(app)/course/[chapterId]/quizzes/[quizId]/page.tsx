import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { EnhancedQuiz } from "./_components/enhanced-quiz";
import { auth } from "@/lib/getAuth";


const QuizPage = async ({ params }: { params: Promise<{ chapterId: string; quizId: string }> }) => {
  const { chapterId, quizId } = await params
  const user = await auth()
  const userId = user.userId

  if (!userId) return

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      chapter: {
        select: {
          id: true,
          title: true,
          course: true,
        },
      },
    },
  })

  const questions = await db.quizQuestion.findMany({
    where: { quizId: quizId },
    orderBy: { position: "asc" },
  })

  // Check for existing result
  const existingResult = await db.quizResult.findUnique({
    where: {
      userId_quizId: {
        userId,
        quizId,
      },
    },
  })

  if (!quiz) {
    return redirect(`/course`)
  }
  const courseId = quiz.chapter.course.id

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

  // Build navigation items
  const navItems: { id: string; title: string; type: "lesson" | "quiz"; position: number }[] = [];

  if (chapterContent) {
    chapterContent.lessons.forEach(l => {
      navItems.push({ id: l.id, title: l.title, type: "lesson", position: l.position });
    });
    chapterContent.quizzes.forEach(q => {
      navItems.push({ id: q.id, title: q.title, type: "quiz", position: q.position });
    });
  }

  navItems.sort((a, b) => a.position - b.position);

  const currentIndex = navItems.findIndex(item => item.id === quizId && item.type === "quiz");
  const prevItem = currentIndex > 0 ? navItems[currentIndex - 1] : null;
  const nextItem = currentIndex < navItems.length - 1 ? navItems[currentIndex + 1] : null;

  const formattedQuestions = questions.map((question) => {
    const options = Array.isArray(question.options)
      ? (question.options as string[]).filter((option) => typeof option === "string")
      : []

    const answers = Array.isArray(question.answers)
      ? (question.answers as string[]).filter((answer) => typeof answer === "string")
      : []

    return {
      id: question.id,
      position: question.position,
      question: question.question,
      questionType: question.questionType,
      questionImageUrl: question.questionImageUrl,
      imageHeight: question.imageHeight,
      options,
      answers,
      points: question.points,
      hint: question.hint,
      hintImageUrl: question.hintImageUrl,
      note: question.note,
    }
  })

  return (
    <EnhancedQuiz
      quiz={quiz}
      questions={formattedQuestions}
      courseId={courseId}
      chapterId={chapterId}
      userId={userId}
      existingResult={existingResult}
      chapterTitle={quiz.chapter?.title || "Chapter"}
      currentIndex={currentIndex}
      totalItems={navItems.length}
      prevItem={prevItem}
      nextItem={nextItem}
    />
  )
}

export default QuizPage

// import { db } from "@/lib/db";
// import { redirect } from "next/navigation";
// import toast from "react-hot-toast";
// import { Quiz } from "./_components/quiz";

// const LessonPage = async ({ params }: { params: Promise<{ chapterId: string; quizId: string }> }) => {
//   const { chapterId, quizId } = await params;

//   const quiz = await db.quiz.findUnique({
//     where: { id: quizId },
//   });

//   const questions = await db.quizQuestion.findMany({
//     where: { quizId: quizId },
//     orderBy: { position: "asc" },
//   });

//   if (!quiz) {
//     toast.error("Something went wrong!");
//     return redirect(`/courses`);
//   }

//   const formattedQuestions = questions.map((question) => {
//     // Ensure options are an array of strings
//     const options = Array.isArray(question.options)
//         ? (question.options as string[]).filter((option) => typeof option === "string")
//         : [];

//     // Ensure answers are an array of strings
//     const answers = Array.isArray(question.answers)
//         ? (question.answers as string[]).filter((answer) => typeof answer === "string")
//         : [];

//     return {
//         ...question,
//         options,  // Now correctly typed as string[]
//         answers,  // Now correctly typed as string[]
//     };
// });

//   return <Quiz quiz={quiz} questions={formattedQuestions} />;
// };

// export default LessonPage;