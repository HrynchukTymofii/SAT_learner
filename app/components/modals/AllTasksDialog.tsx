import React from "react";
import { Text, View } from "react-native";
import { LayoutGrid } from "lucide-react-native";
import { Question } from "@/types";
import { Fonts, usePalette } from "@/constants/palette";
import { T, Tap } from "@/components/ds";
import { Sheet } from "@/components/ds/overlays";

interface AllTasksDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  answeredQuestions: Record<string, boolean>;
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
}

/** Grid of every question: mint = right, rose = wrong, outlined = current. Tap one to jump to it. */
const AllTasksDialog = ({ isOpen, onClose, questions, answeredQuestions, currentQuestionIndex, onQuestionSelect }: AllTasksDialogProps) => {
  const c = usePalette();
  const values = Object.values(answeredQuestions);
  const right = values.filter(Boolean).length;
  const wrong = values.length - right;

  return (
    <Sheet visible={isOpen} onClose={onClose} icon={LayoutGrid} title="All questions" text={`${values.length} of ${questions.length} answered`} scroll>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        <Stat label="Answered" value={values.length} bg={c.lav} />
        <Stat label="Right" value={right} bg={c.mint} />
        <Stat label="Wrong" value={wrong} bg={c.rose} />
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {questions.map((q, i) => {
          const answered = q.id in answeredQuestions;
          const correct = answeredQuestions[q.id];
          const current = i === currentQuestionIndex;
          const bg = answered ? (correct ? c.mint : c.rose) : c.surface;
          const fg = answered ? c.onPastel : c.ink;
          return (
            <Tap
              key={q.id}
              onPress={() => {
                onQuestionSelect(i);
                onClose();
              }}
              accessibilityLabel={`Question ${i + 1}${answered ? (correct ? ", right" : ", wrong") : ""}`}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: bg,
                borderWidth: current ? 2.5 : 1.5,
                borderColor: current ? c.ink : answered ? "transparent" : c.line,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={{ fontFamily: Fonts.bodyBold, fontSize: 15, color: fg }}>{i + 1}</Text>
            </Tap>
          );
        })}
      </View>
    </Sheet>
  );
};

function Stat({ label, value, bg }: { label: string; value: number; bg: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderRadius: 18, paddingVertical: 10, alignItems: "center" }}>
      <Text style={{ fontFamily: Fonts.display, fontSize: 22, color: "#0B0A0F" }}>{value}</Text>
      <T variant="caption" onPastel>
        {label}
      </T>
    </View>
  );
}

export default AllTasksDialog;
