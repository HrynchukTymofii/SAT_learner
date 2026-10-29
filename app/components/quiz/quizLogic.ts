import { Question } from "@/types";
import { calculateSATScore } from "@/lib/utils";

// Pure quiz rules: no React, no database, no navigation.

export type PageType = "wrong" | "saved" | "topic" | "random" | "worst" | "exam";

// questionId → selected options (grid-in: the typed answer)
export type Answers = Record<string, string[]>;
// questionId → answered correctly; a missing key means not answered yet
export type AnsweredMap = Record<string, boolean>;

export interface LatestResult {
  score: number;
  answers: Answers;
}

export interface QuizResults {
  correctCount: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  totalScore: number;
  satScore?: number | null;
}

// Exam bonus: +10 points with at most this many wrong answers, +10 more for a perfect run
export const EXAM_BONUS_MAX_WRONG = 2;

// Grid-in answers: "0.5", ".5", "1/2" and "0,50" are the same number
function normalizeAnswer(answer: string): number | string {
  const s = answer.trim().replace(/\s+/g, "").replace(",", ".");
  const fraction = s.match(/^(-?\d*\.?\d+)\/(\d*\.?\d+)$/);
  const n = fraction ? Number(fraction[1]) / Number(fraction[2]) : Number(s);
  return s !== "" && Number.isFinite(n) ? n : s.toLowerCase();
}

function sameAnswer(a: string, b: string) {
  const x = normalizeAnswer(a);
  const y = normalizeAnswer(b);
  if (typeof x === "number" && typeof y === "number") return Math.abs(x - y) < 1e-9;
  return x === y;
}

export function isCorrect(correctAnswers: string[], userAnswers: string[] = []) {
  return (
    correctAnswers.length === userAnswers.length &&
    correctAnswers.every((a) => userAnswers.some((u) => sameAnswer(a, u)))
  );
}

export function buildAnsweredMap(questions: Question[], answers: Answers): AnsweredMap {
  const answered: AnsweredMap = {};
  for (const q of questions) {
    if (answers[q.id]?.length) answered[q.id] = isCorrect(q.answers, answers[q.id]);
  }
  return answered;
}

export function countAnswered(answered: AnsweredMap) {
  return Object.keys(answered).length;
}

/**
 * First unanswered question, searching forward from `from` and then wrapping
 * around to the start. -1 when all are answered.
 */
export function findNextUnanswered(questions: Question[], answered: AnsweredMap, from: number) {
  for (let i = from; i < questions.length; i++) {
    if (!(questions[i].id in answered)) return i;
  }
  for (let i = 0; i < Math.min(from, questions.length); i++) {
    if (!(questions[i].id in answered)) return i;
  }
  return -1;
}

export function scoreResults(
  pageType: PageType,
  questions: Question[],
  answers: Answers
): QuizResults {
  const totalQuestions = questions.length;
  const correctCount = questions.filter((q) => isCorrect(q.answers, answers[q.id])).length;
  const percentage = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;

  if (pageType === "exam") {
    const passed = totalQuestions - correctCount <= EXAM_BONUS_MAX_WRONG;
    let totalScore = correctCount;
    if (passed) totalScore += 10;
    if (correctCount === totalQuestions) totalScore += 10;
    return {
      correctCount,
      totalQuestions,
      percentage,
      passed,
      totalScore,
      satScore: totalQuestions ? calculateSATScore(correctCount, totalQuestions) : null,
    };
  }

  return { correctCount, totalQuestions, percentage, passed: percentage >= 90, totalScore: correctCount };
}
