// Same answer check as the app (app/components/quiz/quizLogic.ts).
// Grid-in answers: "0.5", ".5", "1/2" and "0,50" are the same number.
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

export function isCorrectAnswer(correctAnswers: string[], userAnswers: string[] = []) {
  return (
    correctAnswers.length === userAnswers.length &&
    correctAnswers.every((a) => userAnswers.some((u) => sameAnswer(a, u)))
  );
}
