import { Checkbox } from "@/components/ui/checkbox";
import { LucideNotebookPen } from "lucide-react";

interface QuizQuestionProps {
  question: { position: number; question: string; options: string[]; answers: string[]; note: string | null; };
  selectedAnswers: string[];
  onAnswerSelect: (option: string) => void;
  results: boolean[] | null; 
}

export const QuizQuestionComponent = ({ question, selectedAnswers, onAnswerSelect, results }: QuizQuestionProps) => {
  const { options, answers } = question;
  console.log(question.note)

  return (
    <div className="hover:border-slate-400 dark:hover:border-slate-400 border-slate-300 dark:border-slate-900 border text-slate-950 dark:text-slate-200 p-4 rounded-md mb-4">
      <div className="flex justify-between mb-2 text-sm font-semibold">
        Question {question.position + 1}
      </div>

      {question.question && <div className="font-medium mb-4">{question.question}</div>}

      <div className="space-y-2">
        {options.map((option: string, index: number) => {
          let bgColor = "";
          if (results) {
            if (answers.includes(option)) {
              bgColor = selectedAnswers.includes(option) ? "bg-green-200 text-slate-900" : "";
            } else {
              bgColor = selectedAnswers.includes(option) ? "bg-red-200 text-slate-900" : "";
            }
          }

          return (
            <div key={index} className={`flex items-center space-x-2 p-2 rounded-md ${bgColor}`}>
              <Checkbox
                className="h-4 w-4 border-slate-400"
                checked={selectedAnswers.includes(option)}
                onCheckedChange={() => onAnswerSelect(option)}
                disabled={!!results}
              />
              <span>{option}</span>
            </div>
          );
        })}
      </div>
      {!!results && question.note && (
        <div className="flex flex-row gap-x-4 font-semibold test-sm bg-slate-700  rounded-md p-4 mt-8">
          <LucideNotebookPen className="h-4 w-4 m-1"/>
          {question.note}
        </div>
      )}
    </div>
  );
};