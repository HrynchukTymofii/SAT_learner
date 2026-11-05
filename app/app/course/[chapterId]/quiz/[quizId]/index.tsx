import { useEffect, useState } from "react"
import { View, Text } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useAuth } from "@/context/AuthContext"
import QuizScreen from "@/components/quiz/QuizScreen"
import { EmptyState, Loading, Screen, TopBar } from "@/components/ds"
import { CircleAlert } from "lucide-react-native"
import { useQuizDatabase } from "@/lib/db/quiz"
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader"

const QuizByTopicScreen = () => {
  const { quizId } = useLocalSearchParams<{ quizId: string }>()
  const router = useRouter()
  const { token } = useAuth()
  const { fetchQuizByIdLocal } = useQuizDatabase();

  const [quizData, setQuizData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quizId || !token) return

    const loadQuiz = async () => {
      try {
        const data = await fetchQuizByIdLocal(quizId);

        //const data = await fetchQuizById(quizId, token)

        if (!data) {
          router.replace("/" as any)
          return
        }

        setQuizData(data)
      } catch (err) {
        setError("Failed to download the test")
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [quizId, token])


  if (loading || !token || !quizId) {
    return (
      <Loading />
    );
  }

  if (error || !quizData) {
    return (
      <Screen header={<TopBar />} contentStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <EmptyState icon={CircleAlert} tone="rose" title="Couldn't open this quiz" text={error || "Something went wrong. Please try again."} action="Go back" onAction={() => router.back()} />
      </Screen>
    )
  }

  return (
    <QuizScreen
      quiz={{
        id: quizData.quiz.id,
        title: quizData.quiz.title,
        chapterId: quizData.quiz.chapterId,
        chapterTitle: quizData.quiz.chapterTitle,
        questions: quizData.quiz.questions,
      }}
      token={token}
      latestResult={quizData.latestResult}
      backUrl="/"
      nextTopicUrl={quizData.nextTopicUrl}
      pageType="topic"
    />
  )
}

export default QuizByTopicScreen








// import React, { useEffect, useState } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   useWindowDimensions,
//   useColorScheme,
//   Modal,
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import AutoHeightWebView from "react-native-autoheight-webview";
// import { LinearGradient } from "expo-linear-gradient";
// import { ArrowLeft } from "lucide-react-native";
// import TopBlur from "@/components/ui/TobBlur";
// import { useAuth } from "@/context/AuthContext";
// import { fetchQuizWithResults } from "@/lib/api/course";
// import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";

// export default function QuizPage() {
//   const router = useRouter();
//   const { chapterId, quizId } = useLocalSearchParams<{ chapterId: string; quizId: string }>();
//   const { token } = useAuth();
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === "dark";

//   const [webViewLoading, setWebViewLoading] = useState(true);
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [quiz, setQuiz] = useState<any>(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [userAnswers, setUserAnswers] = useState<string[]>([]);
//   const [feedback, setFeedback] = useState<(string | null)[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showResults, setShowResults] = useState(false);
//   const [finalScore, setFinalScore] = useState(0);
//   const { width: containerWidth } = useWindowDimensions();

//   // ✅ Load quiz and previous results
//   useEffect(() => {
//     if (!token || !quizId) return;
//     const load = async () => {
//       setLoading(true);
//       const res = await fetchQuizWithResults(quizId, token);
//       if (res.success) {
//         const q = res.data.quiz;
//         const latest = res.data.latestResult;
//         setQuiz(q);

//         const prevAnswers = latest?.answers || Array(q.questions.length).fill(null);
//         setUserAnswers(prevAnswers);

//         const fb = q.questions.map((question: any, i: number) => {
//           const ans = prevAnswers[i];
//           if (!ans) return null;
//           return question.answers.includes(ans)
//             ? "✅ Correct!"
//             : question.hint || "❌ Incorrect.";
//         });
//         setFeedback(fb);

//         if (latest?.score || prevAnswers.every((a: any) => a !== null)) {
//           setFinalScore(latest?.score || 0);
//           setIsCompleted(true);
//           setShowResults(true); // ✅ Show results card immediately
//         }
//       }
//       setLoading(false);
//     };
//     load();
//   }, [quizId, token]);

//   if (loading || !quiz) {
//     return (
//       <SafeAreaView
//         style={{
//           flex: 1,
//           justifyContent: "center",
//           alignItems: "center",
//           backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9",
//         }}
//       >
//         <Loading />
//       </SafeAreaView>
//     );
//   }

//   const questions = quiz.questions;
//   const question = questions[currentIndex];

//   const handleSelectOption = (opt: string) => {
//     if (isCompleted) return; // ✅ Disable selecting during review
//     const isCorrect = question.answers.includes(opt);
//     const updatedAnswers = [...userAnswers];
//     updatedAnswers[currentIndex] = opt;
//     setUserAnswers(updatedAnswers);

//     const updatedFeedback = [...feedback];
//     updatedFeedback[currentIndex] = isCorrect
//       ? "✅ Correct!"
//       : question.hint || "❌ Incorrect.";
//     setFeedback(updatedFeedback);
//   };

//   const handleNext = () => {
//     if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
//   };
//   const handlePrev = () => {
//     if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
//   };

//   const handleFinish = () => {
//     const score = userAnswers.reduce((acc, ans, idx) => {
//       if (!ans) return acc;
//       return acc + (questions[idx].answers.includes(ans) ? questions[idx].points : 0);
//     }, 0);
//     setFinalScore(score);
//     setShowResults(true);
//     setIsCompleted(true);
//   };

//   const handleRestart = () => {
//     setUserAnswers(Array(questions.length).fill(null));
//     setFeedback(Array(questions.length).fill(null));
//     setCurrentIndex(0);
//     setShowResults(false);
//     setIsCompleted(false);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9" }}>
//       {!isDark && <TopBlur />}

//       {/* Header */}
//       <View style={{ flexDirection: "row", alignItems: "center", padding: 12 }}>
//         <TouchableOpacity onPress={() => router.back()} style={{ borderRadius: 12, overflow: "hidden" }}>
//           <LinearGradient
//             colors={isDark ? ["#1e3a8a", "#8A5CE6"] : ["#8A5CE6", "#8A5CE6"]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 }}
//           >
//             <ArrowLeft size={18} color="#fff" />
//             <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>Back</Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>

//       {/* Quiz Content */}
//       <ScrollView contentContainerStyle={{ padding: 12 }}>
//         <Text style={{ fontSize: 22, fontWeight: "700", color: isDark ? "#EFEAF7" : "#0B0A0F", marginBottom: 12 }}>
//           Question {currentIndex + 1} of {questions.length}
//         </Text>

//         {webViewLoading && (
//           <View
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               justifyContent: "center",
//               alignItems: "center",
//               backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9",
//               zIndex: 10,
//             }}
//           >
//             <Loading />
//           </View>
//         )}

//         <AutoHeightWebView
//           key={currentIndex}
//           source={{
//             uri: `https://www.satlearner.com/expo-course/${chapterId}/quizzes/${quizId}/question/${question.id}`,
//           }}
//           style={{ width: containerWidth || "100%", minHeight: 150, marginBottom: 12, opacity: webViewLoading ? 0 : 1 }}
//           scrollEnabled={false}
//           customStyle={isDark ? `html, body { background-color: #0f172a; color: #f5f5f4; margin:0;} *{background-color:inherit;color:inherit}` : ""}
//           onLoadStart={() => setWebViewLoading(true)}
//           onLoadEnd={() => setWebViewLoading(false)}
//         />

//         {/* Options */}
//         {!webViewLoading &&
//           question.options.map((opt: string, i: number) => {
//             const userAnswer = userAnswers[currentIndex];
//             const selected = userAnswer === opt;
//             const correct = question.answers.includes(opt);

//             let bgColor = isDark ? "#17151C" : "#fff";
//             let borderColor = isDark ? "#2B2733" : "#D9D2E5";

//             if (selected) {
//               if (correct) bgColor = "#2E9A5E33";
//               else bgColor = "#D93F5533";
//             } else if (isCompleted && correct) {
//               // ✅ highlight correct even if not selected
//               bgColor = "#2E9A5E22";
//             }

//             return (
//               <TouchableOpacity
//                 key={i}
//                 disabled={isCompleted}
//                 onPress={() => handleSelectOption(opt)}
//                 style={{
//                   marginBottom: 12,
//                   padding: 14,
//                   borderRadius: 12,
//                   borderWidth: 1,
//                   borderColor,
//                   backgroundColor: bgColor,
//                 }}
//               >
//                 <Text style={{ color: isDark ? "#EFEAF7" : "#0B0A0F", fontWeight: "600" }}>{opt}</Text>
//               </TouchableOpacity>
//             );
//           })}

//         {feedback[currentIndex] && (
//           <Text
//             style={{
//               marginTop: 10,
//               color: feedback[currentIndex]?.includes("✅") ? "#2E9A5E" : "#D93F55",
//               fontWeight: "600",
//             }}
//           >
//             {feedback[currentIndex]}
//           </Text>
//         )}

//         {/* Navigation */}
//         <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
//           <TouchableOpacity
//             onPress={handlePrev}
//             disabled={currentIndex === 0}
//             style={{
//               flex: 1,
//               marginRight: 6,
//               paddingVertical: 12,
//               borderRadius: 12,
//               backgroundColor: currentIndex === 0 ? "#7E788955" : isDark ? "#2B2733" : "#7A4BDB",
//               alignItems: "center",
//             }}
//           >
//             <Text style={{ color: "#fff", fontWeight: "600" }}>Previous</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={handleNext}
//             style={{
//               flex: 1,
//               marginLeft: 6,
//               paddingVertical: 12,
//               borderRadius: 12,
//               backgroundColor: isDark ? "#2E9A5E" : "#7A4BDB",
//               alignItems: "center",
//             }}
//           >
//             <Text style={{ color: "#fff", fontWeight: "600" }}>
//               {currentIndex === questions.length - 1
//                 ? "Finish"
//                 : "Next"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* ✅ Fullscreen Results Modal */}
//       <Modal visible={showResults} animationType="fade" transparent>
//         <View
//           style={{
//             flex: 1,
//             justifyContent: "center",
//             alignItems: "center",
//             backgroundColor: "rgba(0,0,0,0.5)",
//             padding: 20,
//           }}
//         >
//           <View
//             style={{
//               width: "100%",
//               borderRadius: 20,
//               backgroundColor: isDark ? "#17151C" : "#fff",
//               padding: 24,
//               alignItems: "center",
//             }}
//           >
//             <Text style={{ fontSize: 24, fontWeight: "700", color: isDark ? "#EFEAF7" : "#0B0A0F" }}>
//               🎓 Quiz Completed!
//             </Text>
//             <Text style={{ fontSize: 18, marginVertical: 12, color: isDark ? "#CFC9DA" : "#2E2A35" }}>
//               Your score: {finalScore} / {questions.reduce((a: number, q: any) => a + q.points, 0)}
//             </Text>

//             <TouchableOpacity
//               onPress={() => {
//                 setShowResults(false);
//                 setCurrentIndex(0);
//               }}
//               style={{
//                 backgroundColor: isDark ? "#2E9A5E" : "#7A4BDB",
//                 paddingVertical: 12,
//                 paddingHorizontal: 32,
//                 borderRadius: 12,
//                 marginBottom: 8,
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "600" }}>Go to Test</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() => router.back()}
//               style={{
//                 backgroundColor: isDark ? "#2B2733" : "#E5DFEE",
//                 paddingVertical: 10,
//                 paddingHorizontal: 28,
//                 borderRadius: 12,
//               }}
//             >
//               <Text style={{ color: isDark ? "#EFEAF7" : "#0B0A0F", fontWeight: "600" }}>Back</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

