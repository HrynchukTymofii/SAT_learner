import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ComprehensiveTest } from "./_components/comprehensive-test"


const TestPage = async () => {
    const courseId = process.env.COURSE_ID || "";
  // Mock userId for demonstration
  const userId = "user"

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        where: { isPublished: true },
        include: {
          quizzes: {
            where: { isPublished: true },
            include: {
              questions: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
    },
  })

  if (!course) {
    return redirect("/")
  }

  // Collect all questions from all quizzes
  const allQuestions = course.chapters
    .flatMap((chapter) => chapter.quizzes)
    .flatMap((quiz) => quiz.questions)
    .map((question) => {
      const options = Array.isArray(question.options)
        ? (question.options as string[]).filter((option) => typeof option === "string")
        : []

      const answers = Array.isArray(question.answers)
        ? (question.answers as string[]).filter((answer) => typeof answer === "string")
        : []

      return {
        ...question,
        options,
        answers,
      }
    })
    .sort(() => Math.random() - 0.5) // Randomize questions

  // Check for existing test result
  const existingResult = null

  return <ComprehensiveTest course={course} questions={allQuestions} userId={userId} existingResult={existingResult} />
}

export default TestPage
