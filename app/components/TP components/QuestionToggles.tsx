import { saveQuestion } from "@/lib/api/quiz";
import { useQuestionDatabase } from "@/lib/db/question";
import { enqueueOfflineAction } from "@/lib/offlineQueue";
import { Question } from "@/types";
import { Bookmark, Lightbulb } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

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

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const hintButton = currentQuestion.hint ? (
    <TouchableOpacity
      onPress={onHintPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: isDark ? "#17151C" : "#EFEAF7",
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? "#2B2733" : "#E5DFEE",
      }}
    >
      <Lightbulb
        size={20}
        color="#E5A50A"
        fill="#E5A50A"
      />
    </TouchableOpacity>
  ) : null;

  const saveButton = (
    <TouchableOpacity
      onPress={toggleSaveQuestion}
      activeOpacity={0.7}
      style={{
        backgroundColor: currentQuestion.isSaved
          ? (isDark ? "#1e40af" : "#E4CDFF")
          : (isDark ? "#17151C" : "#EFEAF7"),
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: currentQuestion.isSaved
          ? "#8A5CE6"
          : (isDark ? "#2B2733" : "#E5DFEE"),
      }}
    >
      <Bookmark
        size={20}
        color={currentQuestion.isSaved ? "#8A5CE6" : (isDark ? "#9C95A8" : "#6B6577")}
        fill={currentQuestion.isSaved ? "#8A5CE6" : "transparent"}
      />
    </TouchableOpacity>
  );

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      {/* Hint Button */}
      {currentQuestion.hint && hintButton}

      {/* Bookmark Button */}
      {saveButton}
    </View>
  );
};

export default QuestionToggles;
