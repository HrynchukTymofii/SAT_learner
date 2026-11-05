import React from "react";
import { TextInput, View } from "react-native";
import { Check, Lightbulb, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Question } from "@/types";
import { isCorrect as isCorrectAnswer } from "@/components/quiz/quizLogic";
import { Fonts, usePalette } from "@/constants/palette";
import { PillButton, T, Tap } from "@/components/ds";

interface QuestionOptionsProps {
  currentQuestion: Question;
  selectedAnswers: Record<string, string[]>;
  isAnswered: boolean;
  pageType: string;
  handleAnswerSelect: (option: string) => void;
}

const LETTERS = "ABCDEFGH";

const QuestionOptions = ({ currentQuestion, selectedAnswers, isAnswered, handleAnswerSelect }: QuestionOptionsProps) => {
  const c = usePalette();
  const [gridInValue, setGridInValue] = React.useState("");

  // Grid-in: show what the user already typed
  React.useEffect(() => {
    if (currentQuestion.questionType === "grid_in") {
      setGridInValue(selectedAnswers[currentQuestion.id]?.[0] || "");
    }
  }, [currentQuestion.id, selectedAnswers]);

  // ---------------------------------------------------------------- grid-in
  if (currentQuestion.questionType === "grid_in") {
    const userAnswer = selectedAnswers[currentQuestion.id]?.[0];
    const correctAnswer = currentQuestion.answers[0];
    const isCorrect = isAnswered && isCorrectAnswer(currentQuestion.answers, userAnswer ? [userAnswer] : []);
    const isIncorrect = isAnswered && !isCorrect;

    return (
      <View style={{ gap: 12 }}>
        {!isAnswered && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Lightbulb size={15} color={c.muted} />
            <T variant="caption" style={{ flex: 1 }}>
              Type a number. Use a dot for decimals, like 3.14
            </T>
          </View>
        )}
        <TextInput
          style={{
            backgroundColor: isCorrect ? c.mint : isIncorrect ? c.rose : c.surface,
            borderWidth: 1.5,
            borderColor: isAnswered ? "transparent" : c.line,
            borderRadius: 20,
            paddingVertical: 16,
            paddingHorizontal: 18,
            fontSize: 22,
            fontFamily: Fonts.display,
            color: isAnswered ? c.onPastel : c.ink,
          }}
          placeholder="Your answer"
          placeholderTextColor={c.subtle}
          value={gridInValue}
          onChangeText={setGridInValue}
          keyboardType="numeric"
          editable={!isAnswered}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={() => gridInValue.trim() && handleAnswerSelect(gridInValue.trim())}
        />
        {!isAnswered && (
          <PillButton
            title="Check answer"
            icon={Check}
            center
            disabled={!gridInValue.trim()}
            onPress={() => handleAnswerSelect(gridInValue.trim())}
          />
        )}
        {isAnswered && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              backgroundColor: isCorrect ? c.mint : c.rose,
              padding: 14,
              borderRadius: 20,
            }}
          >
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.onPastel, alignItems: "center", justifyContent: "center" }}>
              {isCorrect ? <Check size={17} color="#fff" strokeWidth={3} /> : <X size={17} color="#fff" strokeWidth={3} />}
            </View>
            <View style={{ flex: 1 }}>
              <T variant="bodyStrong" onPastel>
                {isCorrect ? "Correct!" : "Not quite"}
              </T>
              {isIncorrect && (
                <T variant="small" onPastel>
                  Correct answer: {correctAnswer}
                </T>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }

  // ---------------------------------------------------------------- multiple choice
  // Short answers (numbers) sit two per row
  const short = currentQuestion.options.every((o) => o.length <= 10);

  return (
    <View style={{ flexDirection: short ? "row" : "column", flexWrap: short ? "wrap" : "nowrap", gap: 10 }}>
      {currentQuestion.options.map((option, index) => (
        <Option
          key={index}
          letter={LETTERS[index] ?? String(index + 1)}
          text={option}
          short={short}
          selected={selectedAnswers[currentQuestion.id]?.includes(option) || false}
          correct={currentQuestion.answers.includes(option)}
          isAnswered={isAnswered}
          onPress={() => {
            if (isAnswered) return;
            Haptics.selectionAsync().catch(() => {});
            handleAnswerSelect(option);
          }}
        />
      ))}
    </View>
  );
};

function Option({
  letter,
  text,
  short,
  selected,
  correct,
  isAnswered,
  onPress,
}: {
  letter: string;
  text: string;
  short: boolean;
  selected: boolean;
  correct: boolean;
  isAnswered: boolean;
  onPress: () => void;
}) {
  const c = usePalette();
  // After checking: right answer mint, wrong pick rose, the rest faded
  const state = !isAnswered ? (selected ? "selected" : "idle") : correct ? "correct" : selected ? "wrong" : "dim";

  const bg = state === "correct" ? c.mint : state === "wrong" ? c.rose : state === "selected" ? c.lav : c.surface;
  const onPastel = state === "correct" || state === "wrong" || state === "selected";
  const fg = onPastel ? c.onPastel : c.ink;

  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        width: short ? "48.5%" : "100%",
        flexGrow: short ? 1 : 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
        minHeight: 60,
        borderRadius: 20,
        backgroundColor: bg,
        borderWidth: 1.5,
        borderColor: onPastel ? "transparent" : c.line,
        opacity: state === "dim" ? 0.5 : 1,
        transform: [{ scale: pressed && !isAnswered ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: onPastel ? c.onPastel : "transparent",
          borderWidth: onPastel ? 0 : 1.5,
          borderColor: c.line,
        }}
      >
        <T variant="smallStrong" color={onPastel ? "#fff" : c.ink}>
          {letter}
        </T>
      </View>
      <T style={{ flex: 1, fontFamily: Fonts.bodyBold, fontSize: short ? 18 : 15.5, lineHeight: short ? 23 : 22 }} color={fg}>
        {text}
      </T>
      {state === "correct" && <Check size={20} color={c.onPastel} strokeWidth={2.6} />}
      {state === "wrong" && <X size={20} color={c.onPastel} strokeWidth={2.6} />}
    </Tap>
  );
}

export default QuestionOptions;
