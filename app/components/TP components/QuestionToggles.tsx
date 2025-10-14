import { saveQuestion } from "@/lib/api/quiz";
import { useQuestionDatabase } from "@/lib/db/question";
import { enqueueOfflineAction } from "@/lib/offlineQueue";
import { cn } from "@/lib/utils";
import { Question } from "@/types";
import { Button } from "@/~/components/ui/button";
import { Bookmark, ThumbsDown, ThumbsUp } from "lucide-react-native";
import { Text, View } from "react-native";

interface QuestionTogglesProps {
  currentQuestion: Question;
  currentIconColor: string;
  currentQuestionIndex: number;
  token: string;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

const QuestionToggles = ({
  currentQuestion,
  currentIconColor,
  currentQuestionIndex,
  token,
  setQuestions,
}: QuestionTogglesProps) => {
  const {
    toggleDislikeQuestionLocal,
    toggleLikeQuestionLocal,
    toggleSaveQuestionLocal,
  } = useQuestionDatabase();
  const toggleSaveQuestion = async () => {
    const updated = await toggleSaveQuestionLocal(currentQuestion.id);
    setLocalQuestionState("isSaved", updated);

    saveQuestion(token, currentQuestion.id).catch(() =>
      enqueueOfflineAction({
        type: "toggleSave",
        payload: { questionId: currentQuestion.id },
      })
    );
  };

  const setLocalQuestionState = (key: keyof Question, value: boolean) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[currentQuestionIndex] = {
        ...updated[currentQuestionIndex],
        [key]: value,
      };
      return updated;
    });
  };

  return (

      <Button
        variant="ghost"
        size="sm"
        onPress={toggleSaveQuestion}
        className={cn(
          "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
          currentQuestion.isSaved && "bg-blue-50 dark:bg-blue-900 py-2"
        )}
      >
        <Bookmark size={20} color={currentIconColor} />
      </Button>
  );
};

export default QuestionToggles;
