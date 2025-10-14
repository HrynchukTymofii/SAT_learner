import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  useColorScheme,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AutoHeightWebView from "react-native-autoheight-webview";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import TopBlur from "@/components/ui/TobBlur";
import { useAuth } from "@/context/AuthContext";
import { fetchQuizWithResults } from "@/lib/api/course";
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";

export default function QuizPage() {
  const router = useRouter();
  const { chapterId, quizId } = useLocalSearchParams<{ chapterId: string; quizId: string }>();
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [webViewLoading, setWebViewLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quiz, setQuiz] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<(string | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const { width: containerWidth } = useWindowDimensions();

  // ✅ Load quiz and previous results
  useEffect(() => {
    if (!token || !quizId) return;
    const load = async () => {
      setLoading(true);
      const res = await fetchQuizWithResults(quizId, token);
      if (res.success) {
        const q = res.data.quiz;
        const latest = res.data.latestResult;
        setQuiz(q);

        const prevAnswers = latest?.answers || Array(q.questions.length).fill(null);
        setUserAnswers(prevAnswers);

        const fb = q.questions.map((question: any, i: number) => {
          const ans = prevAnswers[i];
          if (!ans) return null;
          return question.answers.includes(ans)
            ? "✅ Correct!"
            : question.hint || "❌ Incorrect.";
        });
        setFeedback(fb);

        if (latest?.score || prevAnswers.every((a: any) => a !== null)) {
          setFinalScore(latest?.score || 0);
          setIsCompleted(true);
          setShowResults(true); // ✅ Show results card immediately
        }
      }
      setLoading(false);
    };
    load();
  }, [quizId, token]);

  if (loading || !quiz) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: isDark ? "#0f172a" : "#f8fafc",
        }}
      >
        <GraduationCap3DLoader />
      </SafeAreaView>
    );
  }

  const questions = quiz.questions;
  const question = questions[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isCompleted) return; // ✅ Disable selecting during review
    const isCorrect = question.answers.includes(opt);
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIndex] = opt;
    setUserAnswers(updatedAnswers);

    const updatedFeedback = [...feedback];
    updatedFeedback[currentIndex] = isCorrect
      ? "✅ Correct!"
      : question.hint || "❌ Incorrect.";
    setFeedback(updatedFeedback);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleFinish = () => {
    const score = userAnswers.reduce((acc, ans, idx) => {
      if (!ans) return acc;
      return acc + (questions[idx].answers.includes(ans) ? questions[idx].points : 0);
    }, 0);
    setFinalScore(score);
    setShowResults(true);
    setIsCompleted(true);
  };

  const handleRestart = () => {
    setUserAnswers(Array(questions.length).fill(null));
    setFeedback(Array(questions.length).fill(null));
    setCurrentIndex(0);
    setShowResults(false);
    setIsCompleted(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}>
      {!isDark && <TopBlur />}

      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ borderRadius: 12, overflow: "hidden" }}>
          <LinearGradient
            colors={isDark ? ["#1e3a8a", "#2563eb"] : ["#3b82f6", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flexDirection: "row", alignItems: "center", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 }}
          >
            <ArrowLeft size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>Back</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Quiz Content */}
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", color: isDark ? "#f1f5f9" : "#1f2937", marginBottom: 12 }}>
          Question {currentIndex + 1} of {questions.length}
        </Text>

        {webViewLoading && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: isDark ? "#0f172a" : "#f8fafc",
              zIndex: 10,
            }}
          >
            <GraduationCap3DLoader />
          </View>
        )}

        <AutoHeightWebView
          key={currentIndex}
          source={{
            uri: `https://www.satlearner.com/expo-course/${chapterId}/quizzes/${quizId}/question/${question.id}`,
          }}
          style={{ width: containerWidth || "100%", minHeight: 150, marginBottom: 12, opacity: webViewLoading ? 0 : 1 }}
          scrollEnabled={false}
          customStyle={isDark ? `html, body { background-color: #0f172a; color: #f5f5f4; margin:0;} *{background-color:inherit;color:inherit}` : ""}
          onLoadStart={() => setWebViewLoading(true)}
          onLoadEnd={() => setWebViewLoading(false)}
        />

        {/* Options */}
        {!webViewLoading &&
          question.options.map((opt: string, i: number) => {
            const userAnswer = userAnswers[currentIndex];
            const selected = userAnswer === opt;
            const correct = question.answers.includes(opt);

            let bgColor = isDark ? "#1e293b" : "#fff";
            let borderColor = isDark ? "#334155" : "#d1d5db";

            if (selected) {
              if (correct) bgColor = "#22c55e33";
              else bgColor = "#ef444433";
            } else if (isCompleted && correct) {
              // ✅ highlight correct even if not selected
              bgColor = "#22c55e22";
            }

            return (
              <TouchableOpacity
                key={i}
                disabled={isCompleted}
                onPress={() => handleSelectOption(opt)}
                style={{
                  marginBottom: 12,
                  padding: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor,
                  backgroundColor: bgColor,
                }}
              >
                <Text style={{ color: isDark ? "#f1f5f9" : "#1f2937", fontWeight: "600" }}>{opt}</Text>
              </TouchableOpacity>
            );
          })}

        {feedback[currentIndex] && (
          <Text
            style={{
              marginTop: 10,
              color: feedback[currentIndex]?.includes("✅") ? "#16a34a" : "#dc2626",
              fontWeight: "600",
            }}
          >
            {feedback[currentIndex]}
          </Text>
        )}

        {/* Navigation */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
          <TouchableOpacity
            onPress={handlePrev}
            disabled={currentIndex === 0}
            style={{
              flex: 1,
              marginRight: 6,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: currentIndex === 0 ? "#64748b55" : isDark ? "#334155" : "#3b82f6",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            style={{
              flex: 1,
              marginLeft: 6,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: isDark ? "#10b981" : "#2563eb",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {currentIndex === questions.length - 1
                ? "Finish"
                : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ✅ Fullscreen Results Modal */}
      <Modal visible={showResults} animationType="fade" transparent>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: 20,
          }}
        >
          <View
            style={{
              width: "100%",
              borderRadius: 20,
              backgroundColor: isDark ? "#1e293b" : "#fff",
              padding: 24,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "700", color: isDark ? "#f1f5f9" : "#1f2937" }}>
              🎓 Quiz Completed!
            </Text>
            <Text style={{ fontSize: 18, marginVertical: 12, color: isDark ? "#cbd5e1" : "#374151" }}>
              Your score: {finalScore} / {questions.reduce((a: number, q: any) => a + q.points, 0)}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowResults(false);
                setCurrentIndex(0);
              }}
              style={{
                backgroundColor: isDark ? "#10b981" : "#2563eb",
                paddingVertical: 12,
                paddingHorizontal: 32,
                borderRadius: 12,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Go to Test</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: isDark ? "#334155" : "#e5e7eb",
                paddingVertical: 10,
                paddingHorizontal: 28,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: isDark ? "#f1f5f9" : "#1f2937", fontWeight: "600" }}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}




// import React, { useEffect, useState } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
//   useWindowDimensions,
//   useColorScheme,
//   StyleSheet,
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import AutoHeightWebView from "react-native-autoheight-webview";
// import { LinearGradient } from "expo-linear-gradient";
// import { ArrowLeft } from "lucide-react-native";
// import TopBlur from "@/components/ui/TobBlur";
// import { useAuth } from "@/context/AuthContext";
// import { fetchQuiz } from "@/lib/api/course";
// import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";

// export default function QuizPage() {
//   const router = useRouter();
//   const { chapterId, quizId } = useLocalSearchParams<{
//     chapterId: string;
//     quizId: string;
//   }>();
//   const { token } = useAuth();
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === "dark";
//   const [webViewLoading, setWebViewLoading] = useState(true)
//   const [quiz, setQuiz] = useState<any>(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [selectedOption, setSelectedOption] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const { width: containerWidth } = useWindowDimensions();

//   useEffect(() => {
//     if (!token || !quizId) return;
//     const load = async () => {
//       setLoading(true);
//       const res = await fetchQuiz(quizId, token);
//       if (res.success) setQuiz(res.data);
//       setLoading(false);
//     };
//     load();
//   }, [quizId, token]);

//   if (loading || !quiz) {
//     return (
//       <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}>
//         <GraduationCap3DLoader />
//       </SafeAreaView>
//     );
//   }

//   const questions = quiz.questions;
//   const question = questions[currentIndex];

//   const handleNext = () => {
//     if (currentIndex < questions.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//       setSelectedOption(null);
//     } else {
//       alert("Quiz completed!");
//     }
//   };

//   const handlePrev = () => {
//     if (currentIndex > 0) {
//       setCurrentIndex(currentIndex - 1);
//       setSelectedOption(null);
//     }
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}>
//       {!isDark && <TopBlur />}

//       {/* Header */}
//       <View style={{ flexDirection: "row", alignItems: "center", padding: 12 }}>
//         <TouchableOpacity
//           onPress={() => router.push("/")}
//           style={{
//             borderRadius: 12,
//             overflow: "hidden",
//             shadowColor: "#000",
//             shadowOffset: { width: 0, height: 4 },
//             shadowOpacity: 0.15,
//             shadowRadius: 8,
//             elevation: 4,
//           }}
//         >
//           <LinearGradient
//             colors={isDark ? ["#1e3a8a", "#2563eb"] : ["#3b82f6", "#2563eb"]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 }}
//           >
//             <ArrowLeft size={18} color="#fff" />
//             <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>Back</Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={{ padding: 12 }}>
//         {/* Question */}
//         <Text style={{ fontSize: 22, fontWeight: "700", color: isDark ? "#f1f5f9" : "#1f2937", marginBottom: 12 }}>
//           Question {currentIndex + 1} of {questions.length}
//         </Text>

//        {/* Loader overlay */}
//       {webViewLoading && (
//         <View
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             justifyContent: "center",
//             alignItems: "center",
//             backgroundColor: isDark ? "#0f172a" : "#fff",
//             zIndex: 10,
//           }}
//         >
//           <ActivityIndicator />
//         </View>
//       )}

//       {/* WebView */}
//       <AutoHeightWebView
//         key={currentIndex}
//         source={{
//           uri: `https://www.satlearner.com/expo-course/${chapterId}/quizzes/${quizId}/question/${question.id}`,
//         }}
//         viewportContent="width=device-width, user-scalable=no"
//         scalesPageToFit
//         style={{ width: containerWidth || "100%", minHeight: 150, marginBottom: 12, opacity: webViewLoading ? 0 : 1 }}
//         scrollEnabled={false}
//         customStyle={
//           isDark
//             ? `html, body { background-color: #0f172a; color: #f5f5f4; margin:0;} *{background-color:inherit;color:inherit}`
//             : ""
//         }
//         onLoadStart={() => setWebViewLoading(true)}
//         onLoadEnd={() => setWebViewLoading(false)}
//       />

//       {/* Options */}
//       {!webViewLoading &&
//         question.options.map((opt: string, i: number) => {
//           const selected = selectedOption === opt;
//           return (
//             <TouchableOpacity
//               key={i}
//               onPress={() => setSelectedOption(opt)}
//               style={{
//                 marginBottom: 12,
//                 padding: 14,
//                 borderRadius: 12,
//                 borderWidth: 1,
//                 borderColor: selected ? "#3b82f6" : isDark ? "#334155" : "#d1d5db",
//                 backgroundColor: selected ? (isDark ? "#1e40af" : "#dbeafe") : isDark ? "#1e293b" : "#fff",
//                 shadowColor: "#000",
//                 shadowOffset: { width: 0, height: 3 },
//                 shadowOpacity: 0.1,
//                 shadowRadius: 6,
//                 elevation: 2,
//               }}
//             >
//               <Text style={{ color: isDark ? "#f1f5f9" : "#1f2937", fontWeight: "600" }}>{opt}</Text>
//             </TouchableOpacity>
//           );
//         })}


//         {/* Navigation Buttons */}
//         <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
//           <TouchableOpacity
//             onPress={handlePrev}
//             disabled={currentIndex === 0}
//             style={{
//               flex: 1,
//               marginRight: 6,
//               paddingVertical: 12,
//               borderRadius: 12,
//               backgroundColor: currentIndex === 0 ? (isDark ? "#334155" : "#e5e7eb") : (isDark ? "#334155" : "#3b82f6"),
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
//               backgroundColor: isDark ? "#10b981" : "#2563eb",
//               alignItems: "center",
//             }}
//           >
//             <Text style={{ color: "#fff", fontWeight: "600" }}>{currentIndex === questions.length - 1 ? "Finish" : "Next"}</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }
