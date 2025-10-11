// import { useEffect, useRef, useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/~/components/ui/card";
// import { useNavigation, useRouter } from "expo-router";
// import { ResetTestDialog } from "./modals/ResetTestDialog";
// import Toast from "react-native-toast-message";
// import { TiptapRenderer } from "./TiptapRenderer";
// import {
//   BackHandler,
//   Dimensions,
//   Platform,
//   ScrollView,
//   View,
// } from "react-native";
// import QuestionImage from "./QuestionImage";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   resetQuiz,
//   submitQuizAnswers,
//   updateUserPoints,
// } from "@/lib/api/quiz";
// import TopBlur from "./ui/TobBlur";
// import BottomBlur from "./ui/BottomBlur";
// import { useColorScheme } from "nativewind";
// import FloatingContactButton from "./FloatingContactButton";
// import { useQuizDatabase } from "@/lib/db/quiz";
// import { useAuth } from "@/context/AuthContext";
// import { enqueueOfflineAction } from "@/lib/offlineQueue";
// import { GetPremiumModal } from "./modals/GetPremiumModal";
// import { Question } from "@/types";
// import QuizHeader, { QuizHeaderRef } from "./TP components/QuizHeader";
// import QuestionToggles from "./TP components/QuestionToggles";
// import QuestionOptions from "./TP components/QuestionOptionsProps";
// import QuestionBottomNav from "./TP components/QuestionBottomNav";
// import ResultsCard from "./TP components/ResultsCard";

// interface LatestResult {
//   score: number;
//   answers: Record<string, string[]>;
// }

// interface TestsPageProps {
//   quiz: {
//     id: string;
//     title: string;
//     chapterTitle: string;
//     questions: Question[];
//   };
//   token: string;
//   backUrl?: string;
//   nextTopicUrl?: string;
//   latestResult?: LatestResult | null;
//   pageType?: "wrong" | "saved" | "topic" | "random" | "worst" | "exam";
//   onRestart?: () => void;
// }

// const TestsPage = ({
//   quiz,
//   token,
//   backUrl = "",
//   nextTopicUrl,
//   latestResult,
//   pageType = "topic",
//   onRestart,
// }: TestsPageProps) => {
//   const router = useRouter();
//   const navigation = useNavigation();
//   const { colorScheme } = useColorScheme();

//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string[]>>({});
//   const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({});

//   const [showResults, setShowResults] = useState(false);
//   const [results, setResults] = useState<any>(null);

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [wasReseted, setWasReseted] = useState(false);

//   const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
//   const [enableFinishSaved, setEnableFinishedSaved] = useState(false);

//   const [isCompleated, setIsCompleated] = useState(false)
//   const { user, setUser } = useAuth();

//   const [isConfirmedAS, setIsConfirmedAS] = useState(false)

//   const [wrongAnswersCount, setWrongAnswersCount] = useState(0);
//   const quizHeaderRef = useRef<QuizHeaderRef>(null);

//   const { resetQuizLocal, submitQuizAnswersLocal } = useQuizDatabase();
//   const [isProModalOpen, setIsProModalOpen] = useState(false);

//   const [questions, setQuestions] = useState(quiz.questions);
//   const answeredQuestionsRef = useRef(answeredQuestions);
//   const selectedAnswersRef = useRef(selectedAnswers);

//   useEffect(() => {
//     answeredQuestionsRef.current = answeredQuestions;
//   }, [answeredQuestions]);
//    useEffect(() => {
//     selectedAnswersRef.current = selectedAnswers;
//   }, [selectedAnswers]);
//   const currentQuestion = questions[currentQuestionIndex];
//   const maxFreeIndex = user?.isPro
//     ? questions.length - 1
//     : Math.max(0, Math.ceil(questions.length / 2) - 1);

//   /**
//    * Initializes the quiz state from the latest quiz result when the component mounts.
//    *
//    * Conditions:
//    * - Runs only once on mount
//    * - Only applies for `topic` and `worst` page types.
//    *
//    * Behavior:
//    * 1. Copies the user's previous answers from `latestResult.answers` into `selectedAnswers`.
//    * 2. Builds an `answeredQuestions` map where each question ID is marked:
//    *    - `true` if all selected answers match the correct answers exactly.
//    *    - `false` otherwise.
//    * 3. Finds the first unanswered question within the free-access range (`maxFreeIndex`) 
//    *    and sets it as the current question index state:
//    *    - If all free questions are answered, sets the last free question as current.
//    */
//   useEffect(() => {
//     const answers = latestResult?.answers;
//     if (!answers || !(pageType === "topic" || pageType === "worst")) return;

//     const latestResultLength = Object.keys(latestResult?.answers ?? {}).length;
//     if(latestResultLength == questions.length){
//       setIsCompleated(true)
//     }

//     const answeredQuestions: Record<string, boolean> = Object.fromEntries(
//       Object.entries(answers).map(([questionId, userAnswers]) => {
//         const question = quiz.questions.find((q) => q.id === questionId);
//         const isCorrect = question ? checkIsCorrect(question.answers, userAnswers) : false;
//         return [questionId, isCorrect] as const;
//       })
//     );

//     setSelectedAnswers(answers);
//     setAnsweredQuestions(answeredQuestions);

//     const firstUnansweredFreeIndex = quiz.questions.findIndex(
//       (q, idx) => !answers[q.id] && idx <= maxFreeIndex
//     );

//     setCurrentQuestionIndex(
//       firstUnansweredFreeIndex >= 0 ? firstUnansweredFreeIndex : maxFreeIndex
//     );
//   }, []);

//   /**
//    * Starts the exam automatically when the component mounts
//    * if the current page type is "exam".
//    */
//   useEffect(() => {
//     if (pageType == "exam") startExam();
//   }, []);

//   /**
//    * Automatically submits the quiz if the user has reached
//    * 3 or more wrong answers during an exam.
//    */
//   useEffect(() => {
//     if (pageType === "exam" && wrongAnswersCount >= 3) {
//       submitQuizResults();
//       return;
//     }
//   }, [wrongAnswersCount]);

//   /**
//    * Handles the hardware back button navigation for both Android and iOS.
//    *
//    * - On Android, intercepts the hardware back button and calls `handleBack()`.
//    * - On iOS / other platforms, intercepts the navigation "beforeRemove" event
//    *   (e.g., back swipe or back button in header) and calls `handleBack()`.
//    */
//   useEffect(() => {
//     if (Platform.OS === "android") {
//       const backAction = () => {
//         handleBack();
//         return true;
//       };

//       const backHandler = BackHandler.addEventListener(
//         "hardwareBackPress",
//         backAction
//       );

//       return () => backHandler.remove();
//     }

//     const beforeRemoveListener = navigation.addListener(
//       "beforeRemove",
//       (e: any) => {
//         e.preventDefault();
//         handleBack();
//       }
//     );

//     return () => {
//       beforeRemoveListener();
//     };
//   }, []);

//   // useEffect(() => {
//   //   if (pageType === "exam") return;
//   //   if (!justAnsweredQuestionId) return;

//   //   // Check if the selected answer has been saved
//   //   const isSet =
//   //     selectedAnswers[justAnsweredQuestionId] &&
//   //     selectedAnswers[justAnsweredQuestionId].length > 0;

//   //   if (isSet) {
//   //     handleNextQuestion();
//   //     setJustAnsweredQuestionId(null);
//   //   }
//   // }, [selectedAnswers, justAnsweredQuestionId]);

//   useEffect(() => {
//     if(answeredQuestions[currentQuestion.id]){
//       handleNextQuestion();
//     }
//   }, [selectedAnswers, answeredQuestions]);

//   /**
//    * Starts or Restarts the exam by initializing the quiz state.
//    *
//    * Behavior:
//    * - Clears all previously selected answers (`selectedAnswers`, `answeredQuestions`).
//    * - Resets the current question index to 0.
//    * - Hides the results (`showResults`) and clears the `results` object.
//    * - Calls `startExam()` on the quiz header via `quizHeaderRef`.
//    * - Shows a success toast notifying the user that the exam has started.
//    */
//   const startExam = () => {
//     setSelectedAnswers({});
//     setAnsweredQuestions({});
//     setCurrentQuestionIndex(0);
//     setShowResults(false);
//     setResults(null)
//     quizHeaderRef.current?.startExam();
    
//     Toast.show({
//       type: "success",
//       text1: "Іспит розпочато! Удачі!",
//       position: "top",
//       visibilityTime: 1000,
//     });
//   };

//   /**
//    * Handles navigating back from the quiz page.
//    *
//    * Behavior:
//    * - If the page is not "saved" and `needSave` is true, submits the quiz results.
//    * - Navigates back to the URL specified by `backUrl`.
//    *
//    * @param needSave - Whether to save/submit the quiz before navigating back (default: true)
//    */
//   const handleBack = async (needSave: boolean = true) => {
//     if (pageType !== "saved" && needSave) {
//       try {
//         await submitQuizResults();
//       } catch (e) {
//         console.warn("submit failed", e);
//       }
//     }
//     //console.log('Pre router')
//     router.push(backUrl as any);
//     //console.log('After router')
//   };

//   /**
//    * Checks if the user's answers match the correct answers exactly.
//    *
//    * @param correctAnswers - Array of correct answer strings
//    * @param userAnswers - Array of user's selected answer strings
//    * @returns true if both arrays contain the same items, false otherwise
//    */
//   const checkIsCorrect = (correctAnswers: string[], userAnswers: string[]): boolean => {
//     return (
//       correctAnswers.length === userAnswers.length &&
//       correctAnswers.every((a) => userAnswers.includes(a))
//     );
//   };


//   const handleAnswerSelect = (option: string) => {
//     const questionId = currentQuestion.id;
//     const nextSelected = {
//       ...selectedAnswers,
//       [questionId]: [option],
//     };
//     setSelectedAnswers(nextSelected);
//     if (pageType == "exam") {
//       return
//     }

//     //console.log("HAS")

//     const isCorrect = checkAnswer(nextSelected[questionId])

//     setAnsweredQuestions(prev => ({
//       ...prev,
//       [questionId]: isCorrect,
//     }));
//     setIsConfirmedAS(false)
//   };

//   const handleExamAnswerSelect = (option: string) => {
//     const questionId = currentQuestion.id;
//     if (!isConfirmedAS && option && !(questionId in answeredQuestions)) {
//       const isCorrect = checkAnswer([option]);
//       setAnsweredQuestions(prev => ({
//         ...prev,
//         [questionId]: isCorrect,
//       }));
//       setIsConfirmedAS(true);
//       return; 
//     }
//   };

//   const checkAnswer = (userAnswers: string[]) => {
//     if (!userAnswers || userAnswers.length === 0) {
//       return false;
//     }

//     const correctAnswers = currentQuestion.answers;
//     const isCorrect = checkIsCorrect(correctAnswers, userAnswers);

//     if (isCorrect) {
//       Toast.show({
//         type: "success",
//         text1: "Правильно! ✅",
//         position: "top",
//         visibilityTime: 700,
//       });
//     } else {
//       setWrongAnswersCount((prev) => prev + 1);
//       Toast.show({
//         type: "error",
//         text1: "Неправильно ❌",
//         position: "top",
//         visibilityTime: 700,
//       });
//     }
//     return isCorrect;
//   };

//   /**
//    * Handles retaking or restarting the quiz.
//    *
//    * Behavior:
//    * - For "random" or "exam" page types, simply calls the `onRestart` callback.
//    * - For other page types:
//    *   1. Resets the quiz locally using `resetQuizLocal`.
//    *   2. Attempts to reset the quiz remotely via `resetQuiz`, falling back to
//    *      enqueueing an offline action if the request fails.
//    *   3. Clears all local quiz state:
//    *      - `currentQuestionIndex`
//    *      - `selectedAnswers`
//    *      - `answeredQuestions`
//    *      - `showResults`
//    *      - `results`
//    *      - Sets `wasReseted` to true.
//    * - Shows an error toast if any operation fails.
//    */
//   const handleRetakeQuiz = async () => {
//     if (pageType == "random") {
//       onRestart?.();
//       return;
//     }

//     if (pageType == "exam") {
//       onRestart?.();
//       return;
//     }

//     try {
//       const result = await resetQuizLocal(quiz.id);

//       if (result.success === false) {
//         throw new Error(result.error || "Failed to reset quiz");
//       }

//       const latestResultLength = Object.keys(latestResult?.answers ?? {}).length;

//       if(latestResultLength !== 0){
//         resetQuiz(token!, quiz.id).catch(() =>
//           enqueueOfflineAction({
//             type: "resetQuiz",
//             payload: { quizId: quiz.id },
//           })
//         );
//       }

//       setWasReseted(true);
//       setCurrentQuestionIndex(0);
//       setSelectedAnswers({});
//       setAnsweredQuestions({});
//       setShowResults(false);
//       setResults(null);
//       setIsCompleated(false);
//     } catch (error) {
//       console.error(error);
//       Toast.show({
//         type: "error",
//         text1: "Щось пішло не так(",
//         position: "top",
//         visibilityTime: 700,
//       });
//     }
//   };

//   const handleNextQuestion = () => {
//     if (pageType === "saved") {
//       const answeredCount = Object.keys(answeredQuestions).length;
//       if (!enableFinishSaved && answeredCount == questions.length) {
//         setEnableFinishedSaved(true);
//       } else if(enableFinishSaved && answeredCount == questions.length) {
//         handleBack();
//       }
//     }

//     setIsConfirmedAS(false);

//     goToNext();
//   };

//   type AnsweredQuestions = Record<string, any>; 

//   const findNextUnanswered = (
//     questions: Question[],
//     answeredQuestions: AnsweredQuestions,
//     startIndex: number = 0,
//     endIndex: number = questions.length
//   ) => {
//     return questions
//       .slice(startIndex, endIndex)
//       .findIndex((q) => answeredQuestions[q.id] === undefined);
//   };

//   const goToNext = () => {
//     const isPro = user?.isPro;

//     if (pageType === "topic" && !isPro) {
//       const isLocked = currentQuestionIndex >= maxFreeIndex;

//       if (isLocked) {
//         setIsProModalOpen(true);
//         return;
//       }
//       const answeredCountFree = Object.keys(answeredQuestions).filter(
//         (id) => questions.findIndex((q) => q.id === id) <= maxFreeIndex
//       ).length;

//       if (answeredCountFree <= maxFreeIndex) {
//         // forward search within free range
//         const forwardFree = findNextUnanswered(
//           questions,
//           answeredQuestions,
//           currentQuestionIndex + 1,
//           maxFreeIndex + 1
//         );

//         if (forwardFree !== -1) {
//           setCurrentQuestionIndex(currentQuestionIndex + 1 + forwardFree);
//           return;
//         }

//         // backward search within free range
//         const backwardFree = findNextUnanswered(
//           questions,
//           answeredQuestions,
//           0,
//           maxFreeIndex + 1
//         );

//         if (backwardFree !== -1) {
//           setCurrentQuestionIndex(backwardFree);
//           return;
//         }
//       }

//       // All free answered → submit quiz
//       submitQuizResults();
//       return;
//     }

//     const answeredCount = Object.keys(answeredQuestions).length;

//     if (answeredCount < questions.length) {
//       // forward search
//       const forward = findNextUnanswered(
//         questions,
//         answeredQuestions,
//         currentQuestionIndex + 1
//       );

//       if (forward !== -1) {
//         setCurrentQuestionIndex(currentQuestionIndex + 1 + forward);
//         return;
//       }

//       // backward search
//       const backward = findNextUnanswered(questions, answeredQuestions);
//       if (backward !== -1) {
//         setCurrentQuestionIndex(backward);
//         return;
//       }
//     }

//     // All answered → submit
//     submitQuizResults();
//   };

//   const submitQuizResults = async () => {
//     //console.log("SubmitQuizResults")
//     // if (isSubmittingRef.current) return; // 🔒 ignore duplicate calls
//     // isSubmittingRef.current = true;

//     if (pageType === "saved") return;

//     setIsSubmitting(true);

//     const answered = answeredQuestionsRef.current;
//     const answeredQuestionsLength = Object.keys(answered).length;
//     const latestResultLength = Object.keys(latestResult?.answers ?? {}).length;

//     //console.log(answeredQuestionsLength)

//     if (pageType !== "exam" && 
//       (answeredQuestionsLength == 0 ||
//       (latestResult && !wasReseted && latestResultLength == answeredQuestionsLength))
//     ) {
//       //console.log('ok')
//       setIsSubmitting(false);
//       return;
//     }

//     //console.log("submit_1")

//     try {
//       // For wrong questions page, merge with existing answers
//       let answersToSubmit = selectedAnswersRef.current;
//       //console.log(answersToSubmit)
//       if (pageType === "wrong" && latestResult && !wasReseted) {
//         const mergedAnswers = { ...latestResult.answers };
//         for (const question of quiz.questions) {
//           if (answersToSubmit[question.id]) {
//             mergedAnswers[question.id] = answersToSubmit[question.id];
//           }
//         }
//         answersToSubmit = mergedAnswers;
//       }

//       let correctCount = 0;
//       for (const q of quiz.questions) {
//         const userAns = answersToSubmit[q.id] || [];
//         const correctAns = q.answers;
//         const isCorrect = checkIsCorrect(correctAns, userAns);
//         if (isCorrect) correctCount++;
//       }

//       //console.log("submit_2")

//       if (pageType === "exam") {
//         const totalQuestions = quiz.questions.length;
//         const wrongCount = totalQuestions - correctCount;
//         let totalScore = correctCount;

//         // +10 if passed (≤2 wrong)
//         const passed = wrongCount <= 2;
//         if (passed) totalScore += 10;

//         // +10 if all correct
//         if (correctCount === totalQuestions) totalScore += 10;

//         setResults({
//           correctCount,
//           totalQuestions,
//           passed,
//           totalScore,
//           percentage: Math.round((correctCount / totalQuestions) * 100),
//         });
//         setShowResults(true);

//         if (totalScore > 0) {
//           if (user) setUser({ ...user, points: user.points + totalScore });
//           await updateUserPoints(token, totalScore).catch(() =>
//             enqueueOfflineAction({
//               type: "updatePoints",
//               payload: { points: totalScore },
//             })
//           );
//         }

//         Toast.show({
//           type: "success",
//           text1: "Екзамен завершено!",
//           position: "top",
//           visibilityTime: 1500,
//         });

//         return;
//       }

//       const percentage = Math.round((correctCount / questions.length) * 100);
//       const passed = percentage >= 90;

//       setResults({
//         correctCount,
//         totalQuestions: questions.length,
//         percentage,
//         passed,
//         totalScore: correctCount,
//       });

//       setShowResults(true);

//       if (pageType === "random") {
//         if (correctCount > 0) {
//           if (user) setUser({ ...user, points: user.points + correctCount });
//           updateUserPoints(token, correctCount).catch((err) =>
//             enqueueOfflineAction({
//               type: "updatePoints",
//               payload: { points: correctCount },
//             })
//           );
//         }
//         return;
//       } else {
//         //console.log("submit_3")
//         const method: "POST" | "PATCH" =
//           (latestResult && !wasReseted) ||
//           (quiz.id === "all" && pageType === "wrong")
//             ? "PATCH"
//             : "POST";

//         //console.log(method)
//         const data = await submitQuizAnswersLocal(
//           quiz.id,
//           answersToSubmit,
//           method
//         );

//         submitQuizAnswers(token!, quiz.id, answersToSubmit, method).catch(() =>
//           enqueueOfflineAction({
//             type: "submitQuiz",
//             payload: { quizId: quiz.id, answers: answersToSubmit, method },
//           })
//         );
//       }

//       Toast.show({
//         type: "success",
//         text1: "Результати збережено!",
//         position: "top",
//         visibilityTime: 700,
//       });
//     } catch (error) {
//       console.error("Error submitting quiz:", error);
//       Toast.show({
//         type: "error",
//         text1: "Помилка при збереженні результатів",
//         position: "top",
//         visibilityTime: 700,
//       });
//     } finally {
//       // isSubmittingRef.current = false;
//       setIsSubmitting(false);
//     }
//   };

//   const previousQuestion = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//     }
//   };

//   const isAnswered = currentQuestion.id in answeredQuestions;
//   const screenHeight = Dimensions.get("window").height;
//   const currentIconColor = colorScheme === "dark" ? "#ffffff" : "#000000";


//   {/* Show results of the quiz */}
//   if (showResults && results) {
//     return (
//       <SafeAreaView className="container mx-auto px-4 pt-8 max-w-4xl bg-slate-50 dark:bg-stone-900 h-full">
//         <TopBlur />
//         <ResetTestDialog
//           isOpen={isResetDialogOpen}
//           onClose={() => setIsResetDialogOpen(false)}
//           onConfirm={handleRetakeQuiz}
//           testTitle={quiz.title}
//         />
//         <ResultsCard
//           results={results}
//           pageType={pageType as any}
//           backUrl={backUrl}
//           nextTopicUrl={nextTopicUrl}
//           setIsResetDialogOpen={setIsResetDialogOpen}
//           handleRetakeQuiz={handleRetakeQuiz}
//           handleBack={handleBack}
//         />
//         <BottomBlur />
//       </SafeAreaView>
//     );
//   }

//   {/** Quiz page */}
//   return (
//     <SafeAreaView
//       className="flex-1 bg-slate-50 dark:bg-stone-900"
//       edges={["top", "bottom"]}
//     >
//       <TopBlur />
//       <ResetTestDialog
//         key={wasReseted ? "reset-1" : "reset-0"}
//         isOpen={isResetDialogOpen}
//         onClose={() => setIsResetDialogOpen(false)}
//         onConfirm={handleRetakeQuiz}
//         testTitle={quiz.title}
//       />
//       {pageType !== "exam" && <FloatingContactButton />}
//       <ScrollView
//         contentContainerStyle={{ minHeight: screenHeight, padding: 8 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <View className="p-2 pt-1 max-w-4xl gap-y-2">
//           <QuizHeader
//             quizTitle={quiz.title}
//             currentQuestionIndex={currentQuestionIndex}
//             questions={questions}
//             answeredQuestions={answeredQuestions}
//             pageType={pageType}
//             currentIconColor={currentIconColor}
//             maxFreeIndex={maxFreeIndex}
//             toggleResetDialog={() => setIsResetDialogOpen(true)}
//             setCurrentQuestionIndex={setCurrentQuestionIndex}
//             setIsProModalOpen={setIsProModalOpen}
//             handleBack={handleBack}
//             submitQuizResults={submitQuizResults}
//             ref={quizHeaderRef}
//           />

//           {/* Question */}
//           <Card className="shadow-lg border-0 bg-white dark:bg-stone-800 pt-2 my-2">
//             <CardHeader className="pb-1 pt-2">
//               <View className="flex flex-row justify-between  items-center">
//                 <CardTitle className="text-lg font-semibold text-green-800 dark:text-green-300">
//                   Питання {currentQuestionIndex + 1}
//                 </CardTitle>
//                 <QuestionToggles
//                   currentQuestion={currentQuestion}
//                   currentQuestionIndex={currentQuestionIndex}
//                   currentIconColor={currentIconColor}
//                   token={token}
//                   setQuestions={setQuestions}
//                 />
//               </View>
//             </CardHeader>
//             <CardContent className="gap-y-4">
//               {currentQuestion.questionImageUrl && (
//                 <QuestionImage
//                   uri={currentQuestion.questionImageUrl}
//                   height={currentQuestion.imageHeight * 1.2}
//                 />
//               )}
//               <TiptapRenderer
//                 content={JSON.parse(currentQuestion.question)}
//                 className="text-gray-900 dark:text-gray-100 text-lg leading-relaxed"
//               />
//             </CardContent>
//           </Card>

//           <QuestionOptions
//             currentQuestion={currentQuestion}
//             selectedAnswers={selectedAnswers}
//             isAnswered={isAnswered}
//             pageType={pageType}
//             isConfirmedAS={isConfirmedAS}
//             handleAnswerSelect={handleAnswerSelect}
//           />

//           <QuestionBottomNav
//             pageType={pageType}
//             currentQuestionIndex={currentQuestionIndex}
//             questions={questions}
//             isCompleated={isCompleated}
//             isConfirmedAS={isConfirmedAS}
//             selectedAnswers={selectedAnswers}
//             answeredQuestions={answeredQuestions}
//             enableFinishSaved={enableFinishSaved}
//             isSubmitting={isSubmitting}
//             currentIconColor={currentIconColor}
//             currentQuestionId={currentQuestion.id}
//             previousQuestion={previousQuestion}
//             handleNextQuestion={handleNextQuestion}
//             setIsConfirmedAS={setIsConfirmedAS}
//             handleExamAnswerSelect={handleExamAnswerSelect}
//           />

//         </View>
//       </ScrollView>
//       <GetPremiumModal
//         isOpen={isProModalOpen}
//         onClose={() => setIsProModalOpen(false)}
//       />
//       <BottomBlur />
//     </SafeAreaView>
//   );
// };

// export default TestsPage;

































// // import { useEffect, useRef, useState } from "react";
// // import { Button } from "@/~/components/ui/button";
// // import {
// //   Card,
// //   CardContent,
// //   CardHeader,
// //   CardTitle,
// // } from "@/~/components/ui/card";
// // import { Badge } from "@/~/components/ui/badge";
// // import {
// //   ArrowLeft,
// //   ThumbsUp,
// //   ThumbsDown,
// //   CheckCircle,
// //   XCircle,
// //   Bookmark,
// //   AlertTriangle,
// //   RotateCcw,
// //   ArrowRight,
// //   Clock,
// // } from "lucide-react-native";
// // import { useNavigation, useRouter } from "expo-router";
// // import { ResetTestDialog } from "./modals/ResetTestDialog";
// // import { cn } from "@/lib/utils";
// // import Toast from "react-native-toast-message";
// // import { TiptapRenderer } from "./TiptapRenderer";
// // import {
// //   BackHandler,
// //   Dimensions,
// //   Image,
// //   Platform,
// //   Pressable,
// //   ScrollView,
// //   Text,
// //   View,
// // } from "react-native";
// // import QuestionImage from "./QuestionImage";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import {
// //   dislikeQuestion,
// //   likeQuestion,
// //   resetQuiz,
// //   saveQuestion,
// //   submitQuizAnswers,
// //   updateUserPoints,
// // } from "@/lib/api/quiz";
// // import { LinearGradient } from "expo-linear-gradient";
// // import TopBlur from "./ui/TobBlur";
// // import BottomBlur from "./ui/BottomBlur";
// // import { useColorScheme } from "nativewind";
// // import FloatingContactButton from "./FloatingContactButton";
// // import { useQuestionDatabase } from "@/lib/db/question";
// // import { useQuizDatabase } from "@/lib/db/quiz";
// // import { useAuth } from "@/context/AuthContext";
// // import { enqueueOfflineAction } from "@/lib/offlineQueue";
// // import { GetPremiumModal } from "./modals/GetPremiumModal";

// // export interface Question {
// //   id: string;
// //   question: string;
// //   imageHeight: number;
// //   questionImageUrl?: string | null;
// //   options: string[];
// //   answers: string[];
// //   explanation?: string;
// //   isSaved: boolean;
// //   isLiked: boolean;
// //   isDisliked: boolean;
// //   likes: number;
// //   dislikes: number;
// // }

// // interface LatestResult {
// //   score: number;
// //   answers: Record<string, string[]>;
// // }

// // interface TestsPageProps {
// //   quiz: {
// //     id: string;
// //     title: string;
// //     chapterTitle: string;
// //     questions: Question[];
// //   };
// //   token: string;
// //   backUrl?: string;
// //   nextTopicUrl?: string;
// //   latestResult?: LatestResult | null;
// //   pageType?: "wrong" | "saved" | "topic" | "random" | "worst" | "exam";
// //   onRestart?: () => void;
// // }

// // const TestsPage = ({
// //   quiz,
// //   token,
// //   backUrl = "",
// //   nextTopicUrl,
// //   latestResult,
// //   pageType = "topic",
// //   onRestart,
// // }: TestsPageProps) => {
// //   const router = useRouter();
// //   const { colorScheme } = useColorScheme();
// //   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// //   const [selectedAnswers, setSelectedAnswers] = useState<
// //     Record<string, string[]>
// //   >({});
// //   const [answeredQuestions, setAnsweredQuestions] = useState<
// //     Record<string, boolean>
// //   >({});
// //   const [questionResults, setQuestionResults] = useState<
// //     Record<string, boolean>
// //   >({});
// //   const [showResults, setShowResults] = useState(false);
// //   const [results, setResults] = useState<any>(null);
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [wasReseted, setWasReseted] = useState(false);
// //   const answeredRef = useRef<Record<string, boolean>>({});
// //   const [skippedQuestions, setSkippedQuestions] = useState<
// //     Record<string, boolean>
// //   >({});
// //   const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
// //   const [enableFinishSaved, setEnableFinishedSaved] = useState(false);
// //   const [justAnsweredQuestionId, setJustAnsweredQuestionId] = useState<
// //     string | null
// //   >(null);
// //   const questionRefs = useRef<(View | null)[]>([]);
// //   const scrollRef = useRef<ScrollView>(null);
// //   const { user, setUser } = useAuth();
// //   const [wrongAnswersCount, setWrongAnswersCount] = useState(0);
// //   const [timeSpent, setTimeSpent] = useState(0);
// //   const [startTime, setStartTime] = useState<number>(0);
// //   const [isExamHasStarted, setIsExamHasStarted] = useState(false);
// //   const [isExamWasFinished, setIsExamWasFinished] = useState(false);

// //   const {
// //     toggleDislikeQuestionLocal,
// //     toggleLikeQuestionLocal,
// //     toggleSaveQuestionLocal,
// //   } = useQuestionDatabase();
// //   const { resetQuizLocal, submitQuizAnswersLocal } = useQuizDatabase();
// //   const [isProModalOpen, setIsProModalOpen] = useState(false);

// //   const [questions, setQuestions] = useState(quiz.questions);
// //   const currentQuestion = questions[currentQuestionIndex];
// //   const timeLimit = 20 * 60;
// //   const maxFreeIndex = user?.isPro
// //     ? questions.length - 1
// //     : Math.max(0, Math.ceil(questions.length / 2)- 1);

// //   // Initialize state from latestResult if available
// //   useEffect(() => {
// //     if (
// //       !wasReseted &&
// //       latestResult?.answers &&
// //       pageType !== "saved" &&
// //       pageType !== "wrong"
// //     ) {
// //       setSelectedAnswers(latestResult.answers);

// //       const answered: Record<string, boolean> = {};
// //       const results: Record<string, boolean> = {};

// //       for (const [questionId, userAnswers] of Object.entries(
// //         latestResult.answers
// //       )) {
// //         const question = quiz.questions.find((q) => q.id === questionId);
// //         if (question) {
// //           const correctAnswers = question.answers;
// //           const isCorrect =
// //             correctAnswers.every((a) => userAnswers.includes(a)) &&
// //             userAnswers.length === correctAnswers.length;

// //           answered[questionId] = true;
// //           results[questionId] = isCorrect;
// //         }
// //       }

// //       setAnsweredQuestions(answered);
// //       setQuestionResults(results);
// //     }
// //   }, [latestResult, quiz.questions, wasReseted, pageType]);

// //   useEffect(() => {
// //     if (!wasReseted && latestResult?.answers && pageType === "topic") {
// //       const firstUnansweredFreeIndex = quiz.questions.findIndex((q, idx) =>
// //         !latestResult.answers[q.id] &&
// //         idx <= maxFreeIndex
// //       );

// //       if (firstUnansweredFreeIndex >= 0) {
// //         setCurrentQuestionIndex(firstUnansweredFreeIndex);
// //       } else {
// //         // All free questions answered, start at last free question
// //         setCurrentQuestionIndex(maxFreeIndex);
// //       }
// //     }
// //   }, [latestResult, quiz.questions, wasReseted, pageType]);

// //   useEffect(() => {
// //     if (pageType === "exam") return;
// //     if (!justAnsweredQuestionId) return;

// //     // Check if the selected answer has been saved
// //     const isSet =
// //       selectedAnswers[justAnsweredQuestionId] &&
// //       selectedAnswers[justAnsweredQuestionId].length > 0;

// //     if (isSet) {
// //       handleNextQuestion();
// //       setJustAnsweredQuestionId(null);
// //     }
// //   }, [selectedAnswers, justAnsweredQuestionId]);

// //   useEffect(() => {
// //     const index = currentQuestionIndex;
// //     if (index >= 0 && scrollRef.current) {
// //       scrollRef.current.scrollTo({ x: index * 48, animated: true });
// //     }
// //   }, [currentQuestionIndex]);

// //   useEffect(() => {
// //     if (!isExamHasStarted || isExamWasFinished) return;

// //     const timer = setInterval(() => {
// //       const elapsed = Math.floor((Date.now() - startTime) / 1000);
// //       setTimeSpent(elapsed);

// //       if (elapsed >= timeLimit) {
// //         handleAutoSubmit();
// //       }
// //     }, 1000);

// //     return () => clearInterval(timer);
// //   }, [isExamHasStarted, startTime, timeLimit, isExamWasFinished]);

// //   useEffect(() => {
// //     if (pageType == "exam") startExam();
// //   }, []);

// //   useEffect(() => {
// //     if (pageType === "exam" && wrongAnswersCount >= 3) {
// //       submitQuizResults();
// //       return;
// //     }
// //   }, [wrongAnswersCount]);

// //   useEffect(() => {
// //     if (Platform.OS === "android") {
// //       const backAction = () => {
// //         pageType === "saved" ? handleBack() : handleBackWithSubmit();
// //         return true; // prevent default back
// //       };

// //       const backHandler = BackHandler.addEventListener(
// //         "hardwareBackPress",
// //         backAction
// //       );

// //       return () => backHandler.remove();
// //     }

// //     const router = useRouter();
// //     const navigation = useNavigation();

// //     const beforeRemoveListener = navigation.addListener(
// //       "beforeRemove",
// //       (e: any) => {
// //         e.preventDefault();
// //         pageType === "saved" ? handleBack() : handleBackWithSubmit();
// //       }
// //     );

// //     return () => {
// //       beforeRemoveListener();
// //     };
// //   }, [pageType, answeredQuestions, questions]);

// //   const startExam = () => {
// //     setSelectedAnswers({});
// //     setCurrentQuestionIndex(0);
// //     setIsExamWasFinished(false);
// //     setShowResults(false);
// //     setTimeSpent(0);
// //     setStartTime(Date.now());
// //     setIsExamHasStarted(true);
// //     Toast.show({
// //       type: "success",
// //       text1: "Іспит розпочато! Удачі!",
// //       position: "top",
// //       visibilityTime: 1000,
// //     });
// //   };

// //   const handleBackWithSubmit = async () => {
// //     // Only submit results if not in saved mode
// //     if (pageType !== "saved") {
// //       await submitQuizResults();
// //     }
// //     router.replace(backUrl as any);
// //   };

// //   const handleBack = () => {
// //     router.replace(backUrl as any);
// //   };

// //   // const handleBackWithSubmit = async () => {
// //   //   // Only submit results if not in saved mode
// //   //   if (pageType !== "saved") {
// //   //     await submitQuizResults();
// //   //   }
// //   //   const path = backUrl.startsWith("/") ? "/tests" + backUrl : "/";
// //   //   router.replace(path as any);
// //   // };

// //   // const handleBack = () => {
// //   //   const path = backUrl.startsWith("/") ? "/tests" + backUrl : "/";
// //   //   router.replace(path as any);
// //   // };

// //   const handleAnswerSelect = (option: string) => {
// //     const questionId = currentQuestion.id;
// //     setSelectedAnswers((prev) => ({
// //       ...prev,
// //       [questionId]: [option],
// //     }));

// //     if (pageType !== "exam") setJustAnsweredQuestionId(questionId);
// //   };

// //   const checkAnswer = () => {
// //     const questionId = currentQuestion.id;
// //     const userAnswers = selectedAnswers[questionId] || [];

// //     if (userAnswers.length === 0) {
// //       return false; // User skipped
// //     }

// //     const correctAnswers = currentQuestion.answers;
// //     const isCorrect =
// //       correctAnswers.every((a) => userAnswers.includes(a)) &&
// //       userAnswers.length === correctAnswers.length;

// //     setAnsweredQuestions((prev) => ({ ...prev, [questionId]: true }));
// //     setQuestionResults((prev) => ({ ...prev, [questionId]: isCorrect }));
// //     answeredRef.current[questionId] = true;

// //     if (isCorrect) {
// //       Toast.show({
// //         type: "success",
// //         text1: "Правильно! ✅",
// //         position: "top",
// //         visibilityTime: 700,
// //       });
// //     } else {
// //       setWrongAnswersCount((prev) => prev + 1);
// //       Toast.show({
// //         type: "error",
// //         text1: "Неправильно ❌",
// //         position: "top",
// //         visibilityTime: 700,
// //       });
// //     }

// //     return isCorrect;
// //   };

// //   const handleNextQuestion = () => {
// //     // In saved mode, just navigate to next question without checking
// //     if (pageType === "saved") {
// //       if (currentQuestionIndex < questions.length - 1) {
// //         checkAnswer();
// //         setCurrentQuestionIndex(currentQuestionIndex + 1);
// //       } else if (!enableFinishSaved) {
// //         checkAnswer();
// //         setEnableFinishedSaved(true);
// //       } else {
// //         handleBack();
// //       }
// //       return;
// //     }

// //     const questionId = currentQuestion.id;

// //     //console.log('next question')

// //     if (!answeredQuestions[questionId]) {
// //       const isCorrect = checkAnswer();

// //       if (!isCorrect) {
// //         const userAnswers = selectedAnswers[questionId] || [];

// //         if (userAnswers.length === 0) {
// //           // Mark as skipped and go to next
// //           setSkippedQuestions((prev) => ({ ...prev, [questionId]: true }));
// //           goToNext();
// //         } else {
// //           // Answered but incorrect — stay on this question
// //           setSkippedQuestions((prev) => {
// //             const copy = { ...prev };
// //             delete copy[questionId];
// //             return copy;
// //           });
// //           return;
// //         }
// //       } else {
// //         goToNext();
// //       }
// //     } else {
// //       goToNext();
// //     }
// //   };

// //   const goToNext = () => {
// //     const isLocked = !user?.isPro && pageType === "topic" && currentQuestionIndex >= maxFreeIndex;
// //     if (isLocked) {
// //       setIsProModalOpen(true);
// //       return;
// //     }
// //     // Try to find the next unanswered question after the current index
// //     const isPro = user?.isPro;

// //     if (isPro) {
// //       // PRO users: old logic
// //       const forward = questions
// //         .slice(currentQuestionIndex + 1)
// //         .findIndex((q) => !answeredQuestions[q.id] && !skippedQuestions[q.id]);

// //       if (forward !== -1) {
// //         setCurrentQuestionIndex(currentQuestionIndex + 1 + forward);
// //         return;
// //       }

// //       const backward = questions.findIndex(
// //         (q) => !answeredQuestions[q.id] && !skippedQuestions[q.id]
// //       );

// //       if (backward !== -1) {
// //         setCurrentQuestionIndex(backward);
// //         return;
// //       }

// //       const allAnswered = questions.every(
// //         (q) => answeredQuestions[q.id] || skippedQuestions[q.id]
// //       );
// //       if (allAnswered) {
// //         submitQuizResults();
// //       }
// //       return;
// //     }

// //     const forwardFree = questions
// //       .slice(currentQuestionIndex + 1, maxFreeIndex + 1)
// //       .findIndex((q) => !answeredQuestions[q.id] && !skippedQuestions[q.id]);

// //     if (forwardFree !== -1) {
// //       setCurrentQuestionIndex(currentQuestionIndex + 1 + forwardFree);
// //       return;
// //     }

// //     const backwardFree = questions
// //       .slice(0, maxFreeIndex + 1)
// //       .findIndex((q) => !answeredQuestions[q.id] && !skippedQuestions[q.id]);

// //     if (backwardFree !== -1) {
// //       setCurrentQuestionIndex(backwardFree);
// //       return;
// //     }

// //     // All free questions answered → submit quiz
// //     submitQuizResults();

// //     // If user tries to go past last free question → show premium modal
// //     if (currentQuestionIndex >= maxFreeIndex) {
// //       setIsProModalOpen(true);
// //     }
// //   };

// //   // const goToNext = () => {
// //   //   const isLocked = !user?.isPro && pageType === "topic" && currentQuestionIndex >= maxFreeIndex;
// //   //   if (isLocked) {
// //   //     setIsProModalOpen(true);
// //   //     return;
// //   //   }
// //   //   // Try to find the next unanswered question after the current index
// //   //   const forward = questions
// //   //     .slice(currentQuestionIndex + 1)
// //   //     .findIndex((q) => !answeredQuestions[q.id] && !skippedQuestions[q.id]);

// //   //   if (forward !== -1) {
// //   //     setCurrentQuestionIndex(currentQuestionIndex + 1 + forward);
// //   //     return;
// //   //   }

// //   //   // If not found forward, look from the start
// //   //   const backward = questions.findIndex(
// //   //     (q) => !answeredQuestions[q.id] && !skippedQuestions[q.id]
// //   //   );

// //   //   if (backward !== -1) {
// //   //     setCurrentQuestionIndex(backward);
// //   //     return;
// //   //   }

// //   //   const allAnswered = questions.every(
// //   //     (q) => answeredQuestions[q.id] || skippedQuestions[q.id]
// //   //   );
// //   //   if (allAnswered) {
// //   //     submitQuizResults();
// //   //   }
// //   // };

// //   const handleRetakeQuiz = async () => {
// //     if (pageType == "random") {
// //       onRestart?.();
// //       return;
// //     }

// //     if (pageType == "exam") {
// //       onRestart?.();
// //       return;
// //     }

// //     try {
// //       const result = await resetQuizLocal(quiz.id);

// //       if (result.success === false) {
// //         throw new Error(result.error || "Failed to reset quiz");
// //       }

// //       resetQuiz(token!, quiz.id).catch(() =>
// //         enqueueOfflineAction({
// //           type: "resetQuiz",
// //           payload: { quizId: quiz.id },
// //         })
// //       );

// //       setWasReseted(true);
// //       setCurrentQuestionIndex(0);
// //       setSelectedAnswers({});
// //       setAnsweredQuestions({});
// //       setQuestionResults({});
// //       setShowResults(false);
// //       setResults(null);
// //     } catch (error) {
// //       console.error(error);
// //       Toast.show({
// //         type: "error",
// //         text1: "Щось пішло не так(",
// //         position: "top",
// //         visibilityTime: 700,
// //       });
// //     }
// //   };

// //   const submitQuizResults = async () => {
// //     if (pageType === "saved") return;

// //     setIsSubmitting(true);

// //     const selectedAnswersLength = Object.keys(selectedAnswers).length;
// //     const latestResultLength = Object.keys(latestResult?.answers ?? {}).length;

// //     if (
// //       selectedAnswersLength == 0 ||
// //       (latestResult && !wasReseted && latestResultLength == selectedAnswersLength)
// //     ) {
// //       setIsSubmitting(false);
// //       return;
// //     }

// //     try {
// //       // For wrong questions page, merge with existing answers
// //       let answersToSubmit = selectedAnswers;

// //       if (pageType === "wrong" && latestResult && !wasReseted) {
// //         const mergedAnswers = { ...latestResult.answers };
// //         for (const question of quiz.questions) {
// //           if (selectedAnswers[question.id]) {
// //             mergedAnswers[question.id] = selectedAnswers[question.id];
// //           }
// //         }
// //         answersToSubmit = mergedAnswers;
// //       }

// //       let correctCount = 0;
// //       for (const q of quiz.questions) {
// //         const userAns = answersToSubmit[q.id] || [];
// //         const correctAns = q.answers;
// //         const isCorrect =
// //           correctAns.length === userAns.length &&
// //           correctAns.every((a) => userAns.includes(a));
// //         if (isCorrect) correctCount++;
// //       }

// //       if (pageType === "exam") {
// //         const totalQuestions = quiz.questions.length;
// //         const wrongCount = totalQuestions - correctCount;
// //         let totalScore = correctCount;

// //         // +10 if passed (≤2 wrong)
// //         const passed = wrongCount <= 2;
// //         if (passed) totalScore += 10;

// //         // +10 if all correct
// //         if (correctCount === totalQuestions) totalScore += 10;

// //         setResults({
// //           correctCount,
// //           totalQuestions,
// //           passed,
// //           totalScore,
// //           percentage: Math.round((correctCount / totalQuestions) * 100),
// //         });
// //         setShowResults(true);

// //         // Update user points
// //         if (totalScore > 0) {
// //           if (user) setUser({ ...user, points: user.points + totalScore });
// //           await updateUserPoints(token, totalScore).catch(() =>
// //             enqueueOfflineAction({
// //               type: "updatePoints",
// //               payload: { points: totalScore },
// //             })
// //           );
// //         }

// //         Toast.show({
// //           type: "success",
// //           text1: "Екзамен завершено!",
// //           position: "top",
// //           visibilityTime: 1500,
// //         });

// //         return;
// //       }

// //       const percentage = Math.round((correctCount / questions.length) * 100);
// //       const passed = percentage >= 90;

// //       setResults({
// //         correctCount,
// //         totalQuestions: questions.length,
// //         percentage,
// //         passed,
// //         totalScore: correctCount,
// //       });

// //       setShowResults(true);

// //       if (pageType === "random") {
// //         if (correctCount > 0) {
// //           if (user)
// //             setUser({
// //               ...user,
// //               points: user.points + correctCount,
// //             });
// //           updateUserPoints(token, correctCount).catch((err) =>
// //             enqueueOfflineAction({
// //               type: "updatePoints",
// //               payload: { points: correctCount },
// //             })
// //           );
// //         }
// //         return;
// //       } else {
// //         const method: "POST" | "PATCH" =
// //           (latestResult && !wasReseted) ||
// //           (quiz.id === "all" && pageType === "wrong")
// //             ? "PATCH"
// //             : "POST";

// //         const data = await submitQuizAnswersLocal(
// //           quiz.id,
// //           answersToSubmit,
// //           method
// //         );

// //         submitQuizAnswers(token!, quiz.id, answersToSubmit, method).catch(() =>
// //           enqueueOfflineAction({
// //             type: "submitQuiz",
// //             payload: { quizId: quiz.id, answers: answersToSubmit, method },
// //           })
// //         );
// //       }

// //       Toast.show({
// //         type: "success",
// //         text1: "Результати збережено!",
// //         position: "top",
// //         visibilityTime: 700,
// //       });
// //     } catch (error) {
// //       console.error("Error submitting quiz:", error);
// //       Toast.show({
// //         type: "error",
// //         text1: "Помилка при збереженні результатів",
// //         position: "top",
// //         visibilityTime: 700,
// //       });
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   const previousQuestion = () => {
// //     if (currentQuestionIndex > 0) {
// //       setCurrentQuestionIndex(currentQuestionIndex - 1);
// //     }
// //   };

// //   const handleAutoSubmit = () => {
// //     Toast.show({
// //       type: "error",
// //       text1: "Час вийшов! Іспит завершено автоматично.",
// //       position: "top",
// //       visibilityTime: 2000,
// //       autoHide: true,
// //       topOffset: 60,
// //     });
// //     submitQuizResults();
// //   };

// //   const toggleSaveQuestion = async () => {
// //     const updated = await toggleSaveQuestionLocal(currentQuestion.id);
// //     setLocalQuestionState("isSaved", updated);

// //     saveQuestion(token, currentQuestion.id).catch(() =>
// //       enqueueOfflineAction({
// //         type: "toggleSave",
// //         payload: { questionId: currentQuestion.id },
// //       })
// //     );
// //   };

// //   const toggleLikeQuestion = async () => {
// //     const updated = await toggleLikeQuestionLocal(currentQuestion.id);
// //     setLocalQuestionState("isLiked", updated);
// //     if (updated) setLocalQuestionState("isDisliked", false);

// //     likeQuestion(token, currentQuestion.id).catch(() =>
// //       enqueueOfflineAction({
// //         type: "toggleLike",
// //         payload: { questionId: currentQuestion.id },
// //       })
// //     );
// //   };

// //   const toggleDislikeQuestion = async () => {
// //     const updated = await toggleDislikeQuestionLocal(currentQuestion.id);
// //     setLocalQuestionState("isDisliked", updated);
// //     if (updated) setLocalQuestionState("isLiked", false);

// //     dislikeQuestion(token, currentQuestion.id).catch(() =>
// //       enqueueOfflineAction({
// //         type: "toggleDislike",
// //         payload: { questionId: currentQuestion.id },
// //       })
// //     );
// //   };

// //   const setLocalQuestionState = (key: keyof Question, value: boolean) => {
// //     setQuestions((prev) => {
// //       const updated = [...prev];
// //       updated[currentQuestionIndex] = {
// //         ...updated[currentQuestionIndex],
// //         [key]: value,
// //       };
// //       return updated;
// //     });
// //   };

// //   const formatTime = (seconds: number) => {
// //     const mins = Math.floor(seconds / 60);
// //     const secs = seconds % 60;
// //     return `${mins}:${secs.toString().padStart(2, "0")}`;
// //   };

// //   const timeRemaining = Math.max(0, timeLimit - timeSpent);
// //   const isAnswered = answeredQuestions[currentQuestion.id];
// //   const screenHeight = Dimensions.get("window").height;
// //   const currentIconColor = colorScheme === "dark" ? "#ffffff" : "#000000";

// //   if (showResults && results) {
// //     return (
// //       <SafeAreaView className="container mx-auto px-4 pt-8 max-w-4xl bg-slate-50 dark:bg-stone-900 h-full">
// //         <TopBlur />
// //         <ResetTestDialog
// //           isOpen={isResetDialogOpen}
// //           onClose={() => setIsResetDialogOpen(false)}
// //           onConfirm={handleRetakeQuiz}
// //           testTitle={quiz.title}
// //         />
// //         <Card className="shadow-xl border-0 bg-white dark:bg-stone-800 overflow-hidden">
// //           <LinearGradient
// //             colors={
// //               results.passed
// //                 ? ["#22c55e", "#059669"]
// //                 : pageType === "exam"
// //                   ? ["#ef4444", "#dc2626"]
// //                   : ["#f97316", "#f59e0b"]
// //             }
// //             start={[0, 0]}
// //             end={[1, 0]}
// //             style={{
// //               padding: 32,
// //               borderTopLeftRadius: 12,
// //               borderTopRightRadius: 12,
// //               marginBottom: 24,
// //             }}
// //           >
// //             <View className="items-center">
// //               {results.passed ? (
// //                 <CheckCircle
// //                   size={80}
// //                   color="white"
// //                   style={{ marginBottom: 16 }}
// //                 />
// //               ) : (
// //                 <AlertTriangle
// //                   size={80}
// //                   color="white"
// //                   style={{ marginBottom: 16 }}
// //                 />
// //               )}
// //               <Text className="text-4xl font-bold text-white mb-2">
// //                 {results.passed
// //                   ? pageType === "exam"
// //                     ? "Іспит складено!"
// //                     : "Відмінно!"
// //                   : pageType === "exam"
// //                     ? "На жаль, ви не склали іспит"
// //                     : "Добре!"}
// //               </Text>
// //               <Text className="text-lg text-white opacity-90">
// //                 {results.passed
// //                   ? pageType === "exam"
// //                     ? "Вітаємо, ви успішно склали іспит!"
// //                     : "Ви успішно пройшли тест!"
// //                   : pageType === "exam"
// //                     ? "Спробуйте підготуватися та пройти ще раз."
// //                     : "Продовжуйте вчитися!"}
// //               </Text>
// //             </View>
// //           </LinearGradient>
// //           <CardContent className="p-8">
// //             <View className="flex-row justify-around mb-8">
// //               <View className="items-center">
// //                 <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
// //                   {results.percentage}%
// //                 </Text>
// //                 <Text className="text-gray-600 dark:text-gray-400">
// //                   Результат
// //                 </Text>
// //               </View>
// //               <View className="items-center">
// //                 <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
// //                   {results.correctCount}/{results.totalQuestions}
// //                 </Text>
// //                 <Text className="text-gray-600 dark:text-gray-400">
// //                   Правильно
// //                 </Text>
// //               </View>
// //             </View>

// //             <View className="flex-col gap-y-4">
// //               <Button
// //                 onPress={handleBack}
// //                 variant="outline"
// //                 className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:border-green-700 "
// //               >
// //                 <Text className="text-green-700 dark:text-green-100">
// //                   {backUrl === "/course" ? "Повернутись до курсу" : "Повернутись до тем"}
// //                 </Text>
// //               </Button>
// //               {nextTopicUrl && pageType === "topic" && (
// //                 <Button
// //                   onPress={() => router.replace(nextTopicUrl as any)}
// //                   className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
// //                 >
// //                   <Text className="text-white">Перейти до наступної теми</Text>
// //                 </Button>
// //               )}
// //               {pageType !== "wrong" && (
// //                 <Button
// //                   onPress={() => {
// //                     if (
// //                       pageType == "saved" ||
// //                       pageType == "random" ||
// //                       pageType == "exam"
// //                     )
// //                       handleRetakeQuiz();
// //                     if (pageType !== "random" && pageType !== "exam")
// //                       setIsResetDialogOpen(true);
// //                   }}
// //                   variant="outline"
// //                   className="dark:border-gray-700"
// //                 >
// //                   <Text className="dark:text-white">Пройти ще раз</Text>
// //                 </Button>
// //               )}
// //             </View>
// //           </CardContent>
// //         </Card>
// //         <BottomBlur />
// //       </SafeAreaView>
// //     );
// //   }

// //   return (
// //     <SafeAreaView
// //       className="flex-1 bg-slate-50 dark:bg-stone-900"
// //       edges={["top", "bottom"]}
// //     >
// //       <TopBlur />
// //       <ResetTestDialog
// //         key={wasReseted ? "reset-1" : "reset-0"}
// //         isOpen={isResetDialogOpen}
// //         onClose={() => setIsResetDialogOpen(false)}
// //         onConfirm={handleRetakeQuiz}
// //         testTitle={quiz.title}
// //       />
// //       {pageType !== "exam" && <FloatingContactButton />}
// //       <ScrollView
// //         contentContainerStyle={{ minHeight: screenHeight, padding: 8 }}
// //         showsVerticalScrollIndicator={false}
// //       >
// //         <View className="p-2 pt-1 max-w-4xl gap-y-2">
// //           <View className="flex flex-row w-full items-center justify-between">
// //             <Button
// //               onPress={pageType === "saved" ? handleBack : handleBackWithSubmit}
// //               className="bg-green-600/10 dark:bg-green-800/20 hover:bg-green-700/20 text-green-600 dark:text-green-400 flex-row items-center gap-2"
// //             >
// //               <ArrowLeft size={16} className="mr-2" color={"#166534"} />
// //               <Text className="text-green-800 dark:text-green-300">
// //                 {Object.keys(answeredQuestions).length >= questions.length ||
// //                 pageType == "saved"
// //                   ? "До тем"
// //                   : pageType == "exam"
// //                     ? "Перервати іспит"
// //                     : "Завершити пізніше"}
// //               </Text>
// //             </Button>

// //             {latestResult?.answers &&
// //               pageType !== "wrong" &&
// //               Object.keys(latestResult.answers).length > 0 && (
// //                 <Button
// //                   onPress={() => setIsResetDialogOpen(true)}
// //                   variant="outline"
// //                   className="dark:border-white"
// //                 >
// //                   <RotateCcw size={20} color={currentIconColor} />
// //                 </Button>
// //               )}
// //             {pageType == "exam" && (
// //               <View className="flex-row items-center gap-2">
// //                 <Clock size={20} color="#16a34a" />
// //                 <Text
// //                   className={cn(
// //                     "font-mono text-lg font-bold",
// //                     timeRemaining < 300 ? "text-red-600" : "text-green-600",
// //                     "dark:text-green-400 dark:font-semibold"
// //                   )}
// //                 >
// //                   {formatTime(timeRemaining)}
// //                 </Text>
// //               </View>
// //             )}
// //           </View>

// //           <Card className="shadow-lg border-0 bg-white dark:bg-stone-800">
// //             <CardHeader className="w-full">
// //               <View className="flex flex-row justify-between items-start">
// //                 <View className="flex-1 min-w-0">
// //                   <CardTitle
// //                     className={`${pageType === "exam" ? "text-xl" : "text-base"} font-bold text-green-800 dark:text-green-300`}
// //                   >
// //                     {quiz.title}
// //                   </CardTitle>
// //                 </View>
// //                 <Badge className="bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-500/20 rounded-lg px-2">
// //                   <Text className="text-green-700 dark:text-green-300">
// //                     {currentQuestionIndex + 1}/{questions.length}
// //                   </Text>
// //                 </Badge>
// //               </View>

// //               <ScrollView
// //                 ref={scrollRef}
// //                 horizontal
// //                 showsHorizontalScrollIndicator={false}
// //                 contentContainerStyle={{ paddingHorizontal: 4, gap: 8 }}
// //                 style={{ marginTop: 8, maxHeight: 50 }}
// //               >
// //                 {questions.map((_, index) => {
// //                   const questionId = questions[index].id;
// //                   const answered = answeredQuestions[questionId];
// //                   const correct = questionResults[questionId];

// //                   const isLocked = pageType === "topic" && !user?.isPro && index > maxFreeIndex;

// //                   return (
// //                     <Pressable
// //                       key={questionId}
// //                       ref={(el) => {
// //                         questionRefs.current[index] = el;
// //                       }}
// //                       onPress={() => {
// //                         if (isLocked) {
// //                           setIsProModalOpen(true);
// //                           return;
// //                         }
// //                         setCurrentQuestionIndex(index);
// //                       }}
// //                       className={cn(
// //                         "w-12 h-10 rounded-xl flex items-center justify-center",
// //                         index === currentQuestionIndex &&
// //                           "border-2 border-green-500",
// //                         isLocked
// //                           ? "bg-gray-400 dark:bg-gray-700 opacity-60"
// //                           : answered
// //                             ? correct
// //                               ? "bg-green-500 "
// //                               : "bg-red-500 "
// //                             : "bg-gray-200  dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
// //                       )}
// //                     >
// //                       <Text
// //                         className={cn(
// //                           " text-sm font-medium",
// //                           answered
// //                             ? correct
// //                               ? " text-white"
// //                               : " text-white"
// //                             : " text-gray-600 dark:text-gray-300"
// //                         )}
// //                       >
// //                         {index + 1}
// //                       </Text>
// //                     </Pressable>
// //                   );
// //                 })}
// //               </ScrollView>
// //               {timeRemaining < 300 && (
// //                 <View className="bg-red-50 border border-red-200 rounded-lg p-3 py-1 mt-3 dark:bg-red-900 dark:border-red-700">
// //                   <View className="flex-row items-center gap-2">
// //                     <AlertTriangle size={20} color="#b91c1c" />
// //                     <Text className="font-medium text-red-700 dark:text-red-400">
// //                       Залишилось менше 5 хвилин!
// //                     </Text>
// //                   </View>
// //                 </View>
// //               )}
// //             </CardHeader>
// //           </Card>

// //           {/* Question */}
// //           <Card className="shadow-lg border-0 bg-white dark:bg-stone-800 pt-2 my-2">
// //             <CardHeader className="pb-1 pt-2">
// //               <View className="flex flex-row justify-between items-center">
// //                 <CardTitle className="text-lg font-semibold text-green-800 dark:text-green-300">
// //                   Питання {currentQuestionIndex + 1}
// //                 </CardTitle>
// //                 <View className="flex flex-row items-center gap-1">
// //                   <Button
// //                     variant="ghost"
// //                     size="sm"
// //                     onPress={toggleSaveQuestion}
// //                     className={cn(
// //                       "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
// //                       currentQuestion.isSaved &&
// //                         "bg-blue-50 dark:bg-blue-900 py-1"
// //                     )}
// //                   >
// //                     <Bookmark size={16} color={currentIconColor} />
// //                   </Button>
// //                   <Button
// //                     variant="ghost"
// //                     size="sm"
// //                     onPress={toggleLikeQuestion}
// //                     className={cn(
// //                       "flex flex-row items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300",
// //                       currentQuestion.isLiked &&
// //                         "bg-green-50 dark:bg-green-900 py-1"
// //                     )}
// //                   >
// //                     <ThumbsUp size={16} color={currentIconColor} />
// //                     {currentQuestion.likes !== 0 && (
// //                       <Text className="text-black dark:text-white text-sm">
// //                         {currentQuestion.likes}
// //                       </Text>
// //                     )}
// //                   </Button>
// //                   <Button
// //                     variant="ghost"
// //                     size="sm"
// //                     onPress={toggleDislikeQuestion}
// //                     className={cn(
// //                       "flex flex-row items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300",
// //                       currentQuestion.isDisliked &&
// //                         "bg-red-50 dark:bg-red-900 py-1"
// //                     )}
// //                   >
// //                     {currentQuestion.dislikes !== 0 && (
// //                       <Text className="text-black dark:text-white text-sm">
// //                         {currentQuestion.dislikes}
// //                       </Text>
// //                     )}
// //                     <ThumbsDown size={16} color={currentIconColor} />
// //                   </Button>
// //                 </View>
// //               </View>
// //             </CardHeader>
// //             <CardContent className="gap-y-4">
// //               {currentQuestion.questionImageUrl && (
// //                 <QuestionImage
// //                   uri={currentQuestion.questionImageUrl}
// //                   height={currentQuestion.imageHeight * 1.2}
// //                 />
// //               )}
// //               <TiptapRenderer
// //                 content={JSON.parse(currentQuestion.question)}
// //                 className="text-gray-900 dark:text-gray-100 text-lg leading-relaxed"
// //               />
// //             </CardContent>
// //           </Card>

// //           <View className="gap-y-3">
// //             {currentQuestion.options.map((option, index) => {
// //               const isSelected =
// //                 selectedAnswers[currentQuestion.id]?.includes(option) || false;
// //               const isCorrectOption = currentQuestion.answers.includes(option);

// //               return (
// //                 <Pressable
// //                   key={index}
// //                   onPress={() => !isAnswered && handleAnswerSelect(option)}
// //                   className={cn(
// //                     "flex-row items-center gap-x-3 md:p-4 py-2 px-3 rounded-lg border transition-all",
// //                     pageType !== "saved" && "cursor-pointer",
// //                     !isAnswered &&
// //                       isSelected &&
// //                       "bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600",
// //                     !isAnswered &&
// //                       !isSelected &&
// //                       "bg-white dark:bg-stone-800 border-slate-300 dark:border-slate-700",
// //                     isAnswered &&
// //                       isCorrectOption &&
// //                       "bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-500",
// //                     isAnswered &&
// //                       !isCorrectOption &&
// //                       isSelected &&
// //                       "bg-red-100 dark:bg-red-900 border-red-400 dark:border-red-600",
// //                     isAnswered &&
// //                       !isCorrectOption &&
// //                       !isSelected &&
// //                       "bg-white dark:bg-stone-800 border-slate-300 dark:border-slate-700",
// //                     !isAnswered &&
// //                       pageType !== "saved" &&
// //                       "hover:bg-gray-100 dark:hover:bg-gray-700"
// //                   )}
// //                 >
// //                   {isAnswered && isCorrectOption && (
// //                     <CheckCircle className="ml-2" size={20} color={"#16a34a"} />
// //                   )}
// //                   {isAnswered && !isCorrectOption && isSelected && (
// //                     <XCircle className="ml-2" size={20} color={"#dc2626"} />
// //                   )}
// //                   <Text className="flex-1 text-black dark:text-white">
// //                     {option}
// //                   </Text>
// //                 </Pressable>
// //               );
// //             })}
// //           </View>

// //           {/* {isAnswered && currentQuestion.explanation && (
// //             <View className="p-4 rounded-lg border bg-gray-50 dark:bg-stone-800 border-gray-200 dark:border-gray-600">
// //               <Text className="text-gray-700 dark:text-gray-300 mt-2">
// //                 <Text className="font-bold">Пояснення:</Text>{" "}
// //                 {currentQuestion.explanation}
// //               </Text>
// //             </View>
// //           )} */}

// //           <View className="flex flex-row justify-between items-center mt-4">
// //             <Button
// //               onPress={previousQuestion}
// //               disabled={currentQuestionIndex === 0}
// //               className="flex-row items-center gap-2 bg-white dark:bg-stone-700 border border-slate-100 dark:border-slate-600 shadow-sm"
// //             >
// //               <ArrowLeft size={16} color={currentIconColor} />
// //               <Text className="text-black dark:text-white">Попереднє</Text>
// //             </Button>

// //             <Button
// //               onPress={() => {
// //                 if (pageType == "exam") {
// //                   setJustAnsweredQuestionId(currentQuestion.id);
// //                 }
// //                 handleNextQuestion();
// //               }}
// //               disabled={isSubmitting}
// //               className="text-white bg-green-600 hover:bg-green-700 flex-row items-center gap-2"
// //             >
// //               {isSubmitting ? (
// //                 <Text className="text-white">Збереження...</Text>
// //               ) : (
// //                 <>
// //                   <Text className="text-white">
// //                     {getNextButtonLabel({
// //                       pageType,
// //                       currentQuestionIndex,
// //                       questions,
// //                       selectedAnswers,
// //                       answeredQuestions,
// //                       enableFinishSaved,
// //                     })}
// //                   </Text>
// //                   {/* Only add arrow if not exam answer button */}
// //                   {!(
// //                     pageType === "exam" &&
// //                     selectedAnswers[questions[currentQuestionIndex].id]?.[0]
// //                   ) && <ArrowRight size={16} color={"white"} />}
// //                 </>
// //               )}
// //             </Button>
// //           </View>
// //         </View>
// //       </ScrollView>
// //       <GetPremiumModal
// //         isOpen={isProModalOpen}
// //         onClose={() => setIsProModalOpen(false)}
// //       />
// //       <BottomBlur />
// //     </SafeAreaView>
// //   );
// // };

// // export default TestsPage;

// // function getNextButtonLabel({
// //   pageType,
// //   currentQuestionIndex,
// //   questions,
// //   selectedAnswers,
// //   answeredQuestions,
// //   enableFinishSaved,
// // }: {
// //   pageType: string;
// //   currentQuestionIndex: number;
// //   questions: { id: string }[];
// //   selectedAnswers: Record<string, string[]>;
// //   answeredQuestions: Record<string, boolean>;
// //   enableFinishSaved: boolean;
// // }) {
// //   const questionId = questions[currentQuestionIndex].id;
// //   const selectedOption = selectedAnswers[questionId]?.[0];

// //   if (pageType === "exam") {
// //     const totalAnswered = Object.keys(answeredQuestions).length;

// //     // If we're at the last unanswered question and an option is picked → Finish
// //     if (
// //       totalAnswered == 19 &&
// //       !answeredQuestions[questionId] &&
// //       selectedOption
// //     ) {
// //       return "Завершити іспит";
// //     }

// //     if (answeredQuestions[questionId]) return "Наступне";
// //     if (selectedOption) return "Відповісти";
// //     return "Наступне";
// //   }

// //   // Non-exam logic
// //   if (Object.keys(answeredQuestions).length < questions.length) {
// //     return "Наступне";
// //   }
// //   if (currentQuestionIndex === questions.length - 1 && enableFinishSaved) {
// //     return "Завершити перегляд";
// //   }
// //   return "Завершити тест";
// // }
