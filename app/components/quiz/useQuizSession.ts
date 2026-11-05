import { useRef, useState } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Question } from "@/types";
import {
  AnsweredMap,
  Answers,
  LatestResult,
  PageType,
  QuizResults,
  buildAnsweredMap,
  countAnswered,
  findNextUnanswered,
  isCorrect,
  scoreResults,
} from "./quizLogic";
import { useQuizPersistence } from "./useQuizPersistence";
import { maybeAskForRating } from "@/lib/ratePrompt";

export interface QuizSessionProps {
  quiz: {
    id: string;
    title: string;
    chapterId: string;
    chapterTitle: string;
    questions: Question[];
  };
  token: string;
  backUrl?: string;
  latestResult?: LatestResult | null;
  pageType?: PageType;
  onRestart?: () => void;
}

interface SessionState {
  questions: Question[];
  index: number;
  selected: Answers;
  answered: AnsweredMap;
  results: QuizResults | null;
  // Opened an already finished quiz (or closed the results): only reviewing
  reviewOnly: boolean;
  // Saved questions page: the next button turns into "finish review"
  finishSavedArmed: boolean;
  resetCount: number;
}

function createInitialState(
  questions: Question[],
  latestResult: LatestResult | null | undefined,
  pageType: PageType
): SessionState {
  const state: SessionState = {
    questions,
    index: 0,
    selected: {},
    answered: {},
    results: null,
    reviewOnly: false,
    finishSavedArmed: false,
    resetCount: 0,
  };

  const answers = latestResult?.answers;
  if (!answers || !(pageType === "topic" || pageType === "worst")) return state;

  // Continue where the user stopped
  const answered = buildAnsweredMap(questions, answers);
  const firstOpen = findNextUnanswered(questions, answered, 0);

  return {
    ...state,
    selected: answers,
    answered,
    index: firstOpen >= 0 ? firstOpen : questions.length - 1,
    reviewOnly: countAnswered(answered) === questions.length,
  };
}

function showAnswerToast(correct: boolean) {
  Toast.show({
    type: correct ? "success" : "error",
    text1: correct ? "Correct" : "Not quite",
    position: "top",
    visibilityTime: 700,
  });
}

/**
 * All quiz state and actions.
 *
 * Actions read the state from `stateRef`, never from the render closure, so they
 * behave the same when called from a button, the exam timer or a navigation listener.
 */
export function useQuizSession({
  quiz,
  token,
  backUrl = "",
  latestResult,
  pageType = "topic",
  onRestart,
}: QuizSessionProps) {
  const router = useRouter();

  const [state, setState] = useState(() =>
    createInitialState(quiz.questions, latestResult, pageType)
  );
  const stateRef = useRef(state);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const leavingRef = useRef(false);

  const update = (patch: Partial<SessionState>) => {
    stateRef.current = { ...stateRef.current, ...patch };
    setState(stateRef.current);
  };

  const persistence = useQuizPersistence({
    quizId: quiz.id,
    questions: quiz.questions,
    token,
    latestResult,
    pageType,
    initialAnsweredCount: countAnswered(state.answered),
  });

  const saveProgress = async (finished = false) => {
    const { selected, answered } = stateRef.current;
    try {
      await persistence.save(selected, countAnswered(answered), finished);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      Toast.show({ type: "error", text1: "Error saving results", position: "top", visibilityTime: 700 });
    }
  };

  // Shows the results screen and saves; safe to call more than once
  const finish = async () => {
    const s = stateRef.current;
    if (pageType === "saved" || s.results) return;
    // The exam timer can run out before anything is answered
    if (countAnswered(s.answered) === 0 && pageType !== "exam") return;

    // Exam: a selected but not yet confirmed option still counts when time runs out
    let answered = s.answered;
    if (pageType === "exam") {
      answered = buildAnsweredMap(s.questions, s.selected);
      Toast.show({ type: "success", text1: "Exam completed!", position: "top", visibilityTime: 1500 });
    }

    const results = scoreResults(pageType, s.questions, s.selected);
    update({ answered, results });

    // Ask for a rating after a good moment: an exam that went well, or a topic answered to the end
    if (pageType === "exam" && results.percentage >= 70) maybeAskForRating("exam_finished");
    else if (pageType === "topic" && countAnswered(answered) === s.questions.length) maybeAskForRating("topic_finished");

    setIsSubmitting(true);
    await saveProgress(true);
    setIsSubmitting(false);
  };

  // Results screen "close": back to the questions to review them
  const closeResults = () => update({ results: null, reviewOnly: true });

  const openPaywall = () => router.push("/payment" as any);

  const leave = async (save: boolean = true) => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    if (save) await saveProgress();

    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (Platform.OS === "android") {
      router.replace(backUrl as any);
    } else {
      router.push(backUrl as any);
      // This screen stays in the stack under the pushed one
      leavingRef.current = false;
    }
  };

  const goToQuestion = (index: number) => update({ index });

  const previousQuestion = () => {
    const { index } = stateRef.current;
    if (index > 0) update({ index: index - 1 });
  };

  // Moves to the next unanswered question, or finishes when none are left
  const goToNext = () => {
    const s = stateRef.current;
    const allAnswered = countAnswered(s.answered) === s.questions.length;

    if (pageType === "saved" && allAnswered) {
      if (s.finishSavedArmed) leave();
      else update({ finishSavedArmed: true });
      return;
    }

    const next = findNextUnanswered(s.questions, s.answered, s.index + 1);
    if (next !== -1) {
      update({ index: next });
      return;
    }
    finish();
  };

  // Tapping an option (or submitting a grid-in): answers right away, except in the exam
  const selectOption = (option: string) => {
    const s = stateRef.current;
    const question = s.questions[s.index];
    if (question.id in s.answered) return;

    const selected = { ...s.selected, [question.id]: [option] };
    if (pageType === "exam") {
      update({ selected });
      return;
    }

    const correct = isCorrect(question.answers, [option]);
    showAnswerToast(correct);
    update({ selected, answered: { ...s.answered, [question.id]: correct } });
    // A wrong answer stays on screen so the user can read the explanation
    if (correct) goToNext();
  };

  // The exam answers only when the next button is pressed
  const pressNext = () => {
    const s = stateRef.current;
    if (pageType === "exam") {
      const question = s.questions[s.index];
      const option = s.selected[question.id]?.[0];

      if (option && !(question.id in s.answered)) {
        const correct = isCorrect(question.answers, [option]);
        showAnswerToast(correct);
        update({ answered: { ...s.answered, [question.id]: correct } });
      }
    }
    goToNext();
  };

  const retake = async () => {
    // Random and exam load new questions and remount this screen
    if (pageType === "random" || pageType === "exam") {
      onRestart?.();
      return;
    }

    try {
      // Saved questions are only reviewed: keep the topic's result
      if (pageType !== "saved") await persistence.reset();

      update({
        index: 0,
        selected: {},
        answered: {},
        results: null,
        reviewOnly: false,
        finishSavedArmed: false,
        resetCount: stateRef.current.resetCount + 1,
      });
    } catch (error) {
      console.error(error);
      Toast.show({ type: "error", text1: "Something went wrong", position: "top", visibilityTime: 700 });
    }
  };

  const setQuestions = (action: Question[] | ((prev: Question[]) => Question[])) => {
    const prev = stateRef.current.questions;
    update({ questions: typeof action === "function" ? action(prev) : action });
  };

  return {
    state,
    isSubmitting,
    leavingRef,
    actions: {
      selectOption,
      pressNext,
      previousQuestion,
      goToQuestion,
      finish,
      closeResults,
      retake,
      leave,
      openPaywall,
      setQuestions,
    },
  };
}
