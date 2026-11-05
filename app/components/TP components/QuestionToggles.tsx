import { saveQuestion } from "@/lib/api/quiz";
import { useQuestionDatabase } from "@/lib/db/question";
import { enqueueOfflineAction } from "@/lib/offlineQueue";
import { Question } from "@/types";
import { Bookmark, Lightbulb } from "lucide-react-native";
import { View } from "react-native";
import { usePalette } from "@/constants/palette";
import { T, Tap } from "@/components/ds";

interface QuestionTogglesProps {
  currentQuestion: Question;
  currentIconColor: string;
  currentQuestionIndex: number;
  token: string;
  chapterId: string;
  quizId: string;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  onHintPress: () => void;
}

const QuestionToggles = ({
  currentQuestion,
  currentIconColor,
  currentQuestionIndex,
  token,
  chapterId,
  quizId,
  setQuestions,
  onHintPress,
}: QuestionTogglesProps) => {
  const {
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

  const c = usePalette();

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {!!currentQuestion.hint && (
        <Tap
          onPress={onHintPress}
          accessibilityLabel="Hint"
          style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: c.butter, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, opacity: pressed ? 0.8 : 1 })}
        >
          <Lightbulb size={14} color={c.onPastel} strokeWidth={2.2} />
          <T variant="smallStrong" onPastel style={{ fontSize: 12 }}>
            Hint
          </T>
        </Tap>
      )}
      <Tap
        onPress={toggleSaveQuestion}
        accessibilityLabel={currentQuestion.isSaved ? "Remove from saved" : "Save question"}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          backgroundColor: currentQuestion.isSaved ? c.lav : c.surface2,
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 7,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Bookmark
          size={14}
          color={currentQuestion.isSaved ? c.onPastel : c.muted}
          fill={currentQuestion.isSaved ? c.onPastel : "transparent"}
          strokeWidth={2.2}
        />
        <T variant="smallStrong" color={currentQuestion.isSaved ? c.onPastel : c.muted} style={{ fontSize: 12 }}>
          {currentQuestion.isSaved ? "Saved" : "Save"}
        </T>
      </Tap>
    </View>
  );
};

export default QuestionToggles;
