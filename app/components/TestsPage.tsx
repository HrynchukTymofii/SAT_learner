import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { ResetTestDialog } from "./modals/ResetTestDialog";
import Toast from "react-native-toast-message";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Dimensions,
  Platform,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetQuiz, submitQuizAnswers, updateUserPoints } from "@/lib/api/quiz";
import TopBlur from "./ui/TobBlur";
import BottomBlur from "./ui/BottomBlur";
import { useColorScheme } from "nativewind";
import { useQuizDatabase } from "@/lib/db/quiz";
import { useAuth } from "@/context/AuthContext";
import { enqueueOfflineAction } from "@/lib/offlineQueue";
import { GetPremiumModal } from "./modals/GetPremiumModal";
import { Question } from "@/types";
import QuizHeader, { QuizHeaderRef } from "./TP components/QuizHeader";
import QuestionToggles from "./TP components/QuestionToggles";
import QuestionOptions from "./TP components/QuestionOptionsProps";
import QuestionBottomNav from "./TP components/QuestionBottomNav";
import ResultsCard from "./TP components/ResultsCard";
import QuestionImage from "./QuestionImage";
import AutoHeightWebView from "react-native-autoheight-webview";
import GraduationCap3DLoader from "./ui/GraduationCapLoader";
import ResultsModal from "./TP components/ResultsCard";
import { useFocusEffect } from "@react-navigation/native";

interface LatestResult {
  score: number;
  answers: Record<string, string[]>;
}

interface TestsPageProps {
  quiz: {
    id: string;
    title: string;
    chapterId: string;
    chapterTitle: string;
    questions: Question[];
  };
  token: string;
  backUrl?: string;
  nextTopicUrl?: string;
  latestResult?: LatestResult | null;
  pageType?: "wrong" | "saved" | "topic" | "random" | "worst" | "exam";
  onRestart?: () => void;
}

const TestsPage = ({
  quiz,
  token,
  backUrl = "",
  nextTopicUrl,
  latestResult,
  pageType = "topic",
  onRestart,
}: TestsPageProps) => {
  const router = useRouter();
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string[]>
  >({});
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Record<string, boolean>
  >({});

  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasReseted, setWasReseted] = useState(false);

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [enableFinishSaved, setEnableFinishedSaved] = useState(false);

  const [isCompleated, setIsCompleated] = useState(false);
  const { user, setUser } = useAuth();

  const [isConfirmedAS, setIsConfirmedAS] = useState(false);

  const [webViewLoading, setWebViewLoading] = useState(true);

  const [wrongAnswersCount, setWrongAnswersCount] = useState(0);
  const quizHeaderRef = useRef<QuizHeaderRef>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const { resetQuizLocal, submitQuizAnswersLocal } = useQuizDatabase();
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const [questions, setQuestions] = useState(quiz.questions);
  const answeredQuestionsRef = useRef(answeredQuestions);
  const selectedAnswersRef = useRef(selectedAnswers);

  const { width: containerWidth } = useWindowDimensions();

  const isSubmittingRef = useRef(false);
  const hasStartedExamRef = useRef(false);

  // useEffect(() => {
  //   console.log("🧠 TestsPage mounted");

  //   return () => {
  //     console.log("🧹 TestsPage unmounted");
  //   };
  // }, []);

  useEffect(() => {
    answeredQuestionsRef.current = answeredQuestions;
  }, [answeredQuestions]);

  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);
  const currentQuestion = questions[currentQuestionIndex];
  const maxFreeIndex = questions.length - 1;

  /**
   * Initializes the quiz state from the latest quiz result when the component mounts.
   *
   * Conditions:
   * - Runs only once on mount
   * - Only applies for `topic` and `worst` page types.
   *
   * Behavior:
   * 1. Copies the user's previous answers from `latestResult.answers` into `selectedAnswers`.
   * 2. Builds an `answeredQuestions` map where each question ID is marked:
   *    - `true` if all selected answers match the correct answers exactly.
   *    - `false` otherwise.
   * 3. Finds the first unanswered question within the free-access range (`maxFreeIndex`)
   *    and sets it as the current question index state:
   *    - If all free questions are answered, sets the last free question as current.
   */
  useEffect(() => {
    const answers = latestResult?.answers;
    if (!answers || !(pageType === "topic" || pageType === "worst")) return;

    const latestResultLength = Object.keys(latestResult?.answers ?? {}).length;
    if (latestResultLength == questions.length) {
      setIsCompleated(true);
    }

    const answeredQuestions: Record<string, boolean> = Object.fromEntries(
      Object.entries(answers).map(([questionId, userAnswers]) => {
        const question = quiz.questions.find((q) => q.id === questionId);
        const isCorrect = question
          ? checkIsCorrect(question.answers, userAnswers)
          : false;
        return [questionId, isCorrect] as const;
      })
    );

    setSelectedAnswers(answers);
    setAnsweredQuestions(answeredQuestions);

    const firstUnansweredFreeIndex = quiz.questions.findIndex(
      (q, idx) => !answers[q.id] && idx <= maxFreeIndex
    );

    setCurrentQuestionIndex(
      firstUnansweredFreeIndex >= 0 ? firstUnansweredFreeIndex : maxFreeIndex
    );
  }, []);

  /**
   * Starts the exam automatically when the component mounts
   * if the current page type is "exam".
   */
  useEffect(() => {
    if (pageType == "exam") startExam();
  }, []);

  // useFocusEffect(
  //   useCallback(() => {
  //     console.log('preStartExam')
  //     if (pageType === "exam") startExam();

  //     return () => {
  //        hasStartedExamRef.current = false;
  //     setSelectedAnswers({});
  //     setAnsweredQuestions({});
  //     setCurrentQuestionIndex(0);
  //     };
  //   }, [pageType])
  // );

  /**
   * Automatically submits the quiz if the user has reached
   * 3 or more wrong answers during an exam.
   */
  useEffect(() => {
    if (pageType === "exam" && wrongAnswersCount >= 3) {
      submitQuizResults();
      return;
    }
  }, [wrongAnswersCount]);

  /**
   * Handles the hardware back button navigation for both Android and iOS.
   *
   * - On Android, intercepts the hardware back button and calls `handleBack()`.
   * - On iOS / other platforms, intercepts the navigation "beforeRemove" event
   *   (e.g., back swipe or back button in header) and calls `handleBack()`.
   */
  useEffect(() => {
    if (Platform.OS === "android") {
      const backAction = () => {
        handleBack();
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }

    const beforeRemoveListener = navigation.addListener(
      "beforeRemove",
      (e: any) => {
        e.preventDefault();
        handleBack();
      }
    );

    return () => {
      beforeRemoveListener();
    };
  }, []);

  // useEffect(() => {
  //   return () => {
  //     hasStartedExamRef.current = false;
  //   };
  // }, []);

  useEffect(() => {
    if (answeredQuestions[currentQuestion.id]) {
      handleNextQuestion();
    }
  }, [selectedAnswers, answeredQuestions]);

  /**
   * Starts or Restarts the exam by initializing the quiz state.
   *
   * Behavior:
   * - Clears all previously selected answers (`selectedAnswers`, `answeredQuestions`).
   * - Resets the current question index to 0.
   * - Hides the results (`showResults`) and clears the `results` object.
   * - Calls `startExam()` on the quiz header via `quizHeaderRef`.
   * - Shows a success toast notifying the user that the exam has started.
   */
  const startExam = () => {
    // if (hasStartedExamRef.current) return; // 🔒 prevent duplicates
    // hasStartedExamRef.current = true;
    setSelectedAnswers({});
    setAnsweredQuestions({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setResults(null);
    quizHeaderRef.current?.startExam();

    Toast.show({
      type: "success",
      text1: "Exam started! Good luck!",
      position: "top",
      visibilityTime: 1000,
    });
  };

  /**
   * Handles navigating back from the quiz page.
   *
   * Behavior:
   * - If the page is not "saved" and `needSave` is true, submits the quiz results.
   * - Navigates back to the URL specified by `backUrl`.
   *
   * @param needSave - Whether to save/submit the quiz before navigating back (default: true)
   */
  const handleBack = async (needSave: boolean = true) => {
    if (pageType !== "saved" && needSave) {
      try {
        await submitQuizResults();
      } catch (e) {
        console.warn("submit failed", e);
      }
    }
    console.log('Pre router')
    if(Platform.OS == "android"){
      router.replace(backUrl as any);
    } else {
      console.log('do push')
      router.push(backUrl as any);
    }
    //console.log('After router')
  };

  /**
   * Checks if the user's answers match the correct answers exactly.
   *
   * @param correctAnswers - Array of correct answer strings
   * @param userAnswers - Array of user's selected answer strings
   * @returns true if both arrays contain the same items, false otherwise
   */
  const checkIsCorrect = (
    correctAnswers: string[],
    userAnswers: string[]
  ): boolean => {
    return (
      correctAnswers.length === userAnswers.length &&
      correctAnswers.every((a) => userAnswers.includes(a))
    );
  };

  const handleAnswerSelect = (option: string) => {
    const questionId = currentQuestion.id;
    const nextSelected = {
      ...selectedAnswers,
      [questionId]: [option],
    };
    setSelectedAnswers(nextSelected);
    if (pageType == "exam") {
      return;
    }

    //console.log("HAS")

    const isCorrect = checkAnswer(nextSelected[questionId]);

    setAnsweredQuestions((prev) => ({
      ...prev,
      [questionId]: isCorrect,
    }));
    setIsConfirmedAS(false);
  };

  const handleExamAnswerSelect = (option: string) => {
    const questionId = currentQuestion.id;
    if (!isConfirmedAS && option && !(questionId in answeredQuestions)) {
      const isCorrect = checkAnswer([option]);
      setAnsweredQuestions((prev) => ({
        ...prev,
        [questionId]: isCorrect,
      }));
      setIsConfirmedAS(true);
      return;
    }
  };

  const checkAnswer = (userAnswers: string[]) => {
    if (!userAnswers || userAnswers.length === 0) {
      return false;
    }

    const correctAnswers = currentQuestion.answers;
    const isCorrect = checkIsCorrect(correctAnswers, userAnswers);

    if (isCorrect) {
      Toast.show({
        type: "success",
        text1: "Correct! ✅",
        position: "top",
        visibilityTime: 700,
      });
    } else {
      setWrongAnswersCount((prev) => prev + 1);
      Toast.show({
        type: "error",
        text1: "Incorrect ❌",
        position: "top",
        visibilityTime: 700,
      });
    }
    return isCorrect;
  };

  /**
   * Handles retaking or restarting the quiz.
   *
   * Behavior:
   * - For "random" or "exam" page types, simply calls the `onRestart` callback.
   * - For other page types:
   *   1. Resets the quiz locally using `resetQuizLocal`.
   *   2. Attempts to reset the quiz remotely via `resetQuiz`, falling back to
   *      enqueueing an offline action if the request fails.
   *   3. Clears all local quiz state:
   *      - `currentQuestionIndex`
   *      - `selectedAnswers`
   *      - `answeredQuestions`
   *      - `showResults`
   *      - `results`
   *      - Sets `wasReseted` to true.
   * - Shows an error toast if any operation fails.
   */
  const handleRetakeQuiz = async () => {
    if (pageType == "random") {
      onRestart?.();
      return;
    }

    if (pageType == "exam") {
      onRestart?.();
      return;
    }

    try {
      const result = await resetQuizLocal(quiz.id);

      if (result.success === false) {
        throw new Error(result.error || "Failed to reset quiz");
      }

      const latestResultLength = Object.keys(
        latestResult?.answers ?? {}
      ).length;

      if (latestResultLength !== 0) {
        resetQuiz(token!, quiz.id).catch(() =>
          enqueueOfflineAction({
            type: "resetQuiz",
            payload: { quizId: quiz.id },
          })
        );
      }

      setWasReseted(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setAnsweredQuestions({});
      setShowResults(false);
      setResults(null);
      setIsCompleated(false);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Something went wrong(:",
        position: "top",
        visibilityTime: 700,
      });
    }
  };

  const handleNextQuestion = () => {
    if (pageType === "saved") {
      const answeredCount = Object.keys(answeredQuestions).length;
      if (!enableFinishSaved && answeredCount == questions.length) {
        setEnableFinishedSaved(true);
      } else if (enableFinishSaved && answeredCount == questions.length) {
        handleBack();
      }
    }

    setIsConfirmedAS(false);

    goToNext();
  };

  type AnsweredQuestions = Record<string, any>;

  const findNextUnanswered = (
    questions: Question[],
    answeredQuestions: AnsweredQuestions,
    startIndex: number = 0,
    endIndex: number = questions.length
  ) => {
    return questions
      .slice(startIndex, endIndex)
      .findIndex((q) => answeredQuestions[q.id] === undefined);
  };

  const goToNext = () => {
    const isPro = user?.isPro;

    if (pageType === "topic" && !isPro) {
      const isLocked = currentQuestionIndex >= maxFreeIndex;

      if (isLocked) {
        //console.log("isLocked");
        setIsProModalOpen(true);
        return;
      }
      const answeredCountFree = Object.keys(answeredQuestions).filter(
        (id) => questions.findIndex((q) => q.id === id) <= maxFreeIndex
      ).length;

      if (answeredCountFree <= maxFreeIndex) {
        // forward search within free range
        const forwardFree = findNextUnanswered(
          questions,
          answeredQuestions,
          currentQuestionIndex + 1,
          maxFreeIndex + 1
        );

        if (forwardFree !== -1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1 + forwardFree);
          return;
        }

        // backward search within free range
        const backwardFree = findNextUnanswered(
          questions,
          answeredQuestions,
          0,
          maxFreeIndex + 1
        );

        if (backwardFree !== -1) {
          setCurrentQuestionIndex(backwardFree);
          return;
        }
      }

      // All free answered → submit quiz
      submitQuizResults();
      return;
    }

    const answeredCount = Object.keys(answeredQuestions).length;

    if (answeredCount < questions.length) {
      // forward search
      const forward = findNextUnanswered(
        questions,
        answeredQuestions,
        currentQuestionIndex + 1
      );

      if (forward !== -1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1 + forward);
        return;
      }

      // backward search
      const backward = findNextUnanswered(questions, answeredQuestions);
      if (backward !== -1) {
        setCurrentQuestionIndex(backward);
        return;
      }
    }

    // All answered → submit
    submitQuizResults();
  };

  const submitQuizResults = async () => {
    // console.log("SubmitQuizResults")
    // if (isSubmittingRef.current) return; // 🔒 prevent duplicate submits
    // isSubmittingRef.current = true;

    if (pageType === "saved") return;

    setIsSubmitting(true);

    const answered = answeredQuestionsRef.current;
    const answeredQuestionsLength = Object.keys(answered).length;
    const latestResultLength = Object.keys(latestResult?.answers ?? {}).length;

    //console.log(answeredQuestionsLength)

    if (
      pageType !== "exam" &&
      (answeredQuestionsLength == 0 ||
        (latestResult &&
          !wasReseted &&
          latestResultLength == answeredQuestionsLength))
    ) {
      //console.log('ok')
      setIsSubmitting(false);
      return;
    }

    //console.log("submit_1")

    try {
      // For wrong questions page, merge with existing answers
      let answersToSubmit = selectedAnswersRef.current;
      //console.log(answersToSubmit)
      if (pageType === "wrong" && latestResult && !wasReseted) {
        const mergedAnswers = { ...latestResult.answers };
        for (const question of quiz.questions) {
          if (answersToSubmit[question.id]) {
            mergedAnswers[question.id] = answersToSubmit[question.id];
          }
        }
        answersToSubmit = mergedAnswers;
      }

      let correctCount = 0;
      for (const q of quiz.questions) {
        const userAns = answersToSubmit[q.id] || [];
        const correctAns = q.answers;
        const isCorrect = checkIsCorrect(correctAns, userAns);
        if (isCorrect) correctCount++;
      }

      //console.log("submit_2")

      if (pageType === "exam") {
        const totalQuestions = quiz.questions.length;
        const wrongCount = totalQuestions - correctCount;
        let totalScore = correctCount;

        // +10 if passed (≤2 wrong)
        const passed = wrongCount <= 2;
        if (passed) totalScore += 10;

        // +10 if all correct
        if (correctCount === totalQuestions) totalScore += 10;

        setResults({
          correctCount,
          totalQuestions,
          passed,
          totalScore,
          percentage: Math.round((correctCount / totalQuestions) * 100),
        });
        setShowResults(true);

        if (totalScore > 0) {
          if (user) setUser({ ...user, points: user.points + totalScore });
          await updateUserPoints(token, totalScore).catch(() =>
            enqueueOfflineAction({
              type: "updatePoints",
              payload: { points: totalScore },
            })
          );
        }

        Toast.show({
          type: "success",
          text1: "Exam completed!",
          position: "top",
          visibilityTime: 1500,
        });

        return;
      }

      const percentage = Math.round((correctCount / questions.length) * 100);
      const passed = percentage >= 90;

      setResults({
        correctCount,
        totalQuestions: questions.length,
        percentage,
        passed,
        totalScore: correctCount,
      });

      setShowResults(true);

      if (pageType === "random") {
        if (correctCount > 0) {
          if (user) setUser({ ...user, points: user.points + correctCount });
          updateUserPoints(token, correctCount).catch((err: any) =>
            enqueueOfflineAction({
              type: "updatePoints",
              payload: { points: correctCount },
            })
          );
        }
        return;
      } else {
        //console.log("submit_3")
        const method: "POST" | "PATCH" =
          (latestResult && !wasReseted) ||
          (quiz.id === "all" && pageType === "wrong")
            ? "PATCH"
            : "POST";

        //console.log(method)
        const data = await submitQuizAnswersLocal(
          quiz.id,
          answersToSubmit,
          method
        );

        submitQuizAnswers(token!, quiz.id, answersToSubmit, method).catch(() =>
          enqueueOfflineAction({
            type: "submitQuiz",
            payload: { quizId: quiz.id, answers: answersToSubmit, method },
          })
        );
      }

      Toast.show({
        type: "success",
        text1: "Results saved!",
        position: "top",
        visibilityTime: 700,
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      Toast.show({
        type: "error",
        text1: "Error saving results",
        position: "top",
        visibilityTime: 700,
      });
    } finally {
      //isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const hideLoader = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500, // fade-out duration
      useNativeDriver: true,
    }).start(() => {
      setWebViewLoading(false);
      fadeAnim.setValue(1); // reset for next loader
    });
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isAnswered = currentQuestion.id in answeredQuestions;
  const screenHeight = Dimensions.get("window").height;
  const currentIconColor = colorScheme === "dark" ? "#ffffff" : "#000000";
  const isDark = colorScheme === "dark";

  {
    /* Show results of the quiz */
  }
  if (showResults && results) {
    return (
      <ResultsModal
        results={results}
        pageType={pageType as any}
        backUrl={backUrl}
        nextTopicUrl={nextTopicUrl}
        setIsResetDialogOpen={setIsResetDialogOpen}
        handleRetakeQuiz={handleRetakeQuiz}
        handleBack={handleBack}
        showResults={showResults}
        setShowResults={setShowResults}
        isDark={isDark}
      />
      // <SafeAreaView className="container mx-auto px-4 pt-8 max-w-4xl bg-[#f8fafc] dark:bg-[#0f172a] h-full">
      //   <TopBlur />
      //   <ResetTestDialog
      //     isOpen={isResetDialogOpen}
      //     onClose={() => setIsResetDialogOpen(false)}
      //     onConfirm={handleRetakeQuiz}
      //     testTitle={quiz.title}
      //   />
      //   <ResultsCard
      //     results={results}
      //     pageType={pageType as any}
      //     backUrl={backUrl}
      //     nextTopicUrl={nextTopicUrl}
      //     setIsResetDialogOpen={setIsResetDialogOpen}
      //     handleRetakeQuiz={handleRetakeQuiz}
      //     handleBack={handleBack}
      //   />
      //   <BottomBlur />
      // </SafeAreaView>
    );
  }

  {
    /** Quiz page */
  }
  return (
    <SafeAreaView
      className="flex-1 bg-[#f8fafc] dark:bg-[#0f172a]"
      edges={["top", "bottom"]}
    >
      {!isDark && <TopBlur />}
      <ResetTestDialog
        key={wasReseted ? "reset-1" : "reset-0"}
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        onConfirm={handleRetakeQuiz}
        testTitle={quiz.title}
      />
      <ScrollView
        contentContainerStyle={{ minHeight: screenHeight, padding: 8 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="py-2 pt-1 max-w-4xl gap-y-2">
          <QuizHeader
            quizTitle={quiz.title}
            currentQuestionIndex={currentQuestionIndex}
            questions={questions}
            answeredQuestions={answeredQuestions}
            pageType={pageType}
            currentIconColor={currentIconColor}
            maxFreeIndex={maxFreeIndex}
            toggleResetDialog={() => setIsResetDialogOpen(true)}
            setCurrentQuestionIndex={setCurrentQuestionIndex}
            setIsProModalOpen={setIsProModalOpen}
            handleBack={handleBack}
            submitQuizResults={submitQuizResults}
            ref={quizHeaderRef}
          />

          {/* Question */}
          <View className="flex flex-row justify-between items-center px-3 mt-3">
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: isDark ? "#f1f5f9" : "#1f2937",
              }}
              className="border border-blue-600 rounded-xl px-4 py-1"
            >
              Question {currentQuestionIndex + 1} of {questions.length}
            </Text>
            <QuestionToggles
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              currentIconColor={currentIconColor}
              token={token}
              setQuestions={setQuestions}
            />
          </View>

          <View style={{ position: "relative", flex: 1 }}>
            {webViewLoading && (
              <Animated.View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                  zIndex: 100,
                  opacity: fadeAnim,
                }}
              >
                <GraduationCap3DLoader />
              </Animated.View>
            )}

            <AutoHeightWebView
              //key={`question-${currentQuestion.id}`}
              source={{
                uri: `https://www.satlearner.com/expo-course/${quiz.chapterId}/quizzes/${quiz.id}/question/${currentQuestion.id}`,
              }}
              style={{
                width: containerWidth || "100%",
                minHeight: 10,
                marginBottom: 4,
                //opacity: webViewLoading ? 0 : 1, // fade-in animation
              }}
              scrollEnabled={false}
              customStyle={
                isDark
                  ? `html, body { margin:0;} .expo-content {background-color: #0f172a; color: #f5f5f4;}`
                  : ""
              }
              onLoadStart={() => setWebViewLoading(true)}
              onLoadEnd={() => {
                setTimeout(() => {
                  hideLoader();
                }, 500); // 300ms delay
              }}
              //onSizeUpdated={({ height }: { height: number }) => setWebViewHeight(height)}
            />
            {currentQuestion.questionImageUrl && (
              <QuestionImage
                uri={currentQuestion.questionImageUrl}
                height={currentQuestion.imageHeight * 1.2}
              />
            )}

            <QuestionOptions
              currentQuestion={currentQuestion}
              selectedAnswers={selectedAnswers}
              isAnswered={isAnswered}
              pageType={pageType}
              handleAnswerSelect={handleAnswerSelect}
            />

            {/* Explanation */}
            {isAnswered && currentQuestion.explanation && (
              <View className="rounded-3xl mt-4 gap-1">
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "700",
                    color: isDark ? "#f1f5f9" : "#1f2937",
                  }}
                  className="border border-blue-600 rounded-xl px-4 py-1 ml-2 mr-auto"
                >
                  Explanation
                </Text>
                <AutoHeightWebView
                  //key={`explanation-currentQuestion.id`}
                  source={{
                    uri: `https://www.satlearner.com/expo-course/${quiz.chapterId}/quizzes/${quiz.id}/question/${currentQuestion.id}/explanation`,
                  }}
                  style={{
                    width: containerWidth || "100%",
                    minHeight: 100,
                    marginBottom: 8,
                    // opacity: webViewLoading ? 0 : 1,
                  }}
                  scrollEnabled={false}
                  customStyle={
                    isDark
                      ? `html, body { margin:0;} .expo-content {background-color: #0f172a; color: #f5f5f4;}`
                      : ``
                  }
                  onLoadStart={() => setWebViewLoading(true)}
                  onLoadEnd={() => {
                    setTimeout(() => {
                      hideLoader();
                    }, 500); // 300ms delay
                  }}
                />
              </View>
            )}

            <QuestionBottomNav
              pageType={pageType}
              currentQuestionIndex={currentQuestionIndex}
              questions={questions}
              isCompleted={isCompleated}
              isConfirmedAS={isConfirmedAS}
              selectedAnswers={selectedAnswers}
              answeredQuestions={answeredQuestions}
              enableFinishSaved={enableFinishSaved}
              isSubmitting={isSubmitting}
              currentIconColor={currentIconColor}
              currentQuestionId={currentQuestion.id}
              previousQuestion={previousQuestion}
              handleNextQuestion={handleNextQuestion}
              setIsConfirmedAS={setIsConfirmedAS}
              handleExamAnswerSelect={handleExamAnswerSelect}
            />
          </View>
        </View>
      </ScrollView>
      {/* <GetPremiumModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      /> */}
      <BottomBlur />
    </SafeAreaView>
  );
};

export default TestsPage;
