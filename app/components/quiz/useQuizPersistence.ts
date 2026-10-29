import { useRef } from "react";
import Toast from "react-native-toast-message";
import { useAuth } from "@/context/AuthContext";
import { useQuizDatabase } from "@/lib/db/quiz";
import { resetQuiz, submitQuizAnswers, updateUserPoints } from "@/lib/api/quiz";
import { enqueueOfflineAction } from "@/lib/offlineQueue";
import { Question } from "@/types";
import { Answers, LatestResult, PageType, scoreResults } from "./quizLogic";

interface Options {
  quizId: string;
  questions: Question[];
  token: string;
  latestResult?: LatestResult | null;
  pageType: PageType;
  initialAnsweredCount: number;
}

/**
 * Saves quiz progress locally and to the server.
 *
 * Every save goes through one queue and checks what was already saved, so calling
 * `save` twice (finish + leave, header button + back gesture) never writes the
 * same result twice or awards points twice.
 */
export function useQuizPersistence({
  quizId,
  questions,
  token,
  latestResult,
  pageType,
  initialAnsweredCount,
}: Options) {
  const { user, setUser } = useAuth();
  const { submitQuizAnswersLocal, resetQuizLocal, fetchSavedQuizAnswersLocal } = useQuizDatabase();

  const userRef = useRef(user);
  userRef.current = user;

  const isAllWrong = pageType === "wrong" && quizId === "all";

  // What the database already holds for this quiz
  const savedRef = useRef({
    exists: !!latestResult,
    answeredCount: initialAnsweredCount,
    wasReset: false,
    // random / exam: points are awarded once per session
    pointsAwarded: false,
  });
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const awardPoints = async (points: number) => {
    if (points <= 0) return;
    const current = userRef.current;
    if (current) setUser({ ...current, points: current.points + points });
    await updateUserPoints(token, points).catch(() =>
      enqueueOfflineAction({ type: "updatePoints", payload: { points } })
    );
  };

  const submit = async (id: string, answers: Answers, method: "POST" | "PATCH") => {
    const res: any = await submitQuizAnswersLocal(id, answers, method);
    if (res?.success === false) throw new Error(res.error);

    submitQuizAnswers(token, id, answers, method).catch(() =>
      enqueueOfflineAction({ type: "submitQuiz", payload: { quizId: id, answers, method } })
    );
  };

  // "All wrong answers" mixes questions from many quizzes: merge each answer into its own quiz's result
  const submitAllWrong = async (answers: Answers) => {
    const byQuiz: Record<string, Answers> = {};
    for (const q of questions) {
      if (!q.quizId || !answers[q.id]) continue;
      (byQuiz[q.quizId] ??= {})[q.id] = answers[q.id];
    }
    for (const [id, changed] of Object.entries(byQuiz)) {
      const existing = (await fetchSavedQuizAnswersLocal(id)) ?? {};
      await submit(id, { ...existing, ...changed }, "PATCH");
    }
  };

  const persist = async (answers: Answers, answeredCount: number, finished: boolean) => {
    const saved = savedRef.current;
    if (pageType === "saved" || answeredCount === 0) return;

    // Points only for a finished exam / random set, once
    if ((pageType === "random" || pageType === "exam") && finished && !saved.pointsAwarded) {
      saved.pointsAwarded = true;
      await awardPoints(scoreResults(pageType, questions, answers).totalScore);
    }
    // Random sets have no quiz row of their own
    if (pageType === "random") return;

    // Nothing new since the last save
    if (saved.exists && saved.answeredCount === answeredCount) return;

    if (isAllWrong) {
      await submitAllWrong(answers);
    } else {
      // The wrong-answers page only shows some questions: keep the rest of the result
      const toSubmit =
        pageType === "wrong" && latestResult && !saved.wasReset
          ? { ...latestResult.answers, ...answers }
          : answers;
      await submit(quizId, toSubmit, saved.exists ? "PATCH" : "POST");
    }
    savedRef.current = { ...saved, exists: true, answeredCount };

    Toast.show({ type: "success", text1: "Results saved!", position: "top", visibilityTime: 700 });
  };

  const save = (answers: Answers, answeredCount: number, finished = false) => {
    const run = queueRef.current.then(() => persist(answers, answeredCount, finished));
    // Keep the queue alive after a failure; the caller still sees the error
    queueRef.current = run.catch(() => {});
    return run;
  };

  // Deletes the result so the quiz starts from scratch
  const reset = async () => {
    await queueRef.current;
    const res = await resetQuizLocal(quizId);
    if (res.success === false) throw new Error(res.error || "Failed to reset quiz");

    if (savedRef.current.exists) {
      resetQuiz(token, quizId).catch(() =>
        enqueueOfflineAction({ type: "resetQuiz", payload: { quizId } })
      );
    }
    savedRef.current = { exists: false, answeredCount: 0, wasReset: true, pointsAwarded: false };
  };

  return { save, reset };
}
