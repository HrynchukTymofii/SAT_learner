import { ReadOnlyEditor } from "@/components/tiptap-templates/simple/readonly-editor";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    quizId: string;
    questionId: string;
  }>;
};

export default async function QuestionPage({ params }: Props) {
  const { quizId, questionId } = await params;

  const question = await db.quizQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question) return notFound();

  return (
    <div className="p-4 bg-white min-h-screen">
      <h2 className="mb-4 text-lg font-semibold">
        {question.position}. Question
      </h2>
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <ReadOnlyEditor initialContent={question.question} />
      </div>
    </div>
  );
}
