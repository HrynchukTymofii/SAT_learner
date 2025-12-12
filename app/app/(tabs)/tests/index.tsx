import { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  BookOpen,
  GraduationCap,
  Heart,
  X,
  Lock,
  Target,
  Zap,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { LoginRequiredModal } from "@/components/modals/LoginRequiredModal";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function QuizzesPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { token, user } = useAuth();

  const handleModeSelect = (mode: string) => {
    if (mode === "exam") {
      router.push("/tests/exams" as any);
      return;
    }

    if (!token || !user) {
      setShowLoginModal(true);
      return;
    }

    switch (mode) {
      case "learn_by_topics":
        router.push("/tests/by-topic" as any);
        return;
    }

    if (!user.isPro) {
      router.push("/payment");
      return;
    }

    switch (mode) {
      case "saved":
        router.push("/tests/saved" as any);
        break;
      case "wrong":
        router.push("/tests/wrong" as any);
        break;
      case "improve":
        router.push("/tests/improve" as any);
        break;
      default:
        break;
    }
  };

  const modes = [
    {
      id: "exam",
      title: "Full SAT Test",
      description: "Complete 70-minute practice test with real SAT conditions",
      icon: GraduationCap,
      isFree: true,
      color: "#06B6D4",
      badge: "Free",
      stats: "70 min • 44 questions",
    },
    // {
    //   id: "learn_by_topics",
    //   title: "Practice by Section",
    //   description: "Focus on specific topics to strengthen your weak areas",
    //   icon: Target,
    //   isFree: true,
    //   color: "#8B5CF6",
    //   badge: "Free",
    //   stats: "Adaptive learning",
    // },
    {
      id: "wrong",
      title: "Incorrect Answers",
      description: "Revisit questions you got wrong to improve faster",
      icon: X,
      isFree: false,
      color: "#EF4444",
      badge: "PRO",
      stats: "Learn from mistakes",
    },
    {
      id: "saved",
      title: "Saved Questions",
      description: "Review questions you marked for later practice",
      icon: Heart,
      isFree: false,
      color: "#F59E0B",
      badge: "PRO",
      stats: "Your bookmarks",
    },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f9fafb" }}
      edges={["bottom"]}
    >
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: 20,
          paddingHorizontal: 20,
          backgroundColor: isDark ? "#111827" : "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: isDark ? "#ffffff" : "#1f2937",
            marginBottom: 8,
            letterSpacing: -0.5,
          }}
        >
          Practice Tests
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: isDark ? "#9ca3af" : "#6b7280",
            lineHeight: 22,
          }}
        >
          Choose your practice mode and start improving
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Test Card */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleModeSelect("exam")}
          style={{
            marginBottom: 24,
            borderRadius: 20,
            overflow: "hidden",
            shadowColor: "#06B6D4",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={["#06B6D4", "#0891B2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 24 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <GraduationCap size={28} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#ffffff",
                  }}
                >
                  Full SAT Test
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.9)",
                    marginTop: 2,
                  }}
                >
                  70 min • 44 questions
                </Text>
              </View>
              {!user?.isPro && (
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.25)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    Free
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.95)",
                marginBottom: 16,
              }}
            >
              Complete practice test with real SAT conditions. Track your time
              and get instant results.
            </Text>
            <View
              style={{
                backgroundColor: "#ffffff",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: "#06B6D4", fontSize: 16, fontWeight: "600" }}
              >
                Start Full Test
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Practice Modes Grid */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: isDark ? "#ffffff" : "#1f2937",
            marginBottom: 16,
          }}
        >
          Practice Modes
        </Text>

        {modes.slice(1).map((mode, index) => {
          const Icon = mode.icon;
          const isLocked = !mode.isFree && !user?.isPro;

          const modeCard = (
            <TouchableOpacity
              key={mode.id}
              activeOpacity={0.7}
              onPress={() => handleModeSelect(mode.id)}
              style={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderRadius: 16,
                padding: 20,
                borderLeftWidth: 4,
                borderLeftColor: mode.color,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                {/* Icon */}
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: isDark ? "#334155" : "#f3f4f6",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Icon size={24} color={mode.color} />
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: isDark ? "#ffffff" : "#1f2937",
                        flex: 1,
                      }}
                    >
                      {mode.title}
                    </Text>
                    {isLocked && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: isDark ? "#312e81" : "#ede9fe",
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Lock
                          size={12}
                          color={isDark ? "#a78bfa" : "#7c3aed"}
                        />
                        <Text
                          style={{
                            marginLeft: 4,
                            fontSize: 11,
                            fontWeight: "600",
                            color: isDark ? "#a78bfa" : "#7c3aed",
                          }}
                        >
                          PRO
                        </Text>
                      </View>
                    )}
                    {!isLocked && mode.isFree && !user?.isPro && (
                      <View
                        style={{
                          backgroundColor: isDark ? "#064e3b" : "#d1fae5",
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: isDark ? "#34d399" : "#059669",
                          }}
                        >
                          Free
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={{
                      fontSize: 14,
                      color: isDark ? "#94a3b8" : "#6b7280",
                      marginBottom: 12,
                      lineHeight: 20,
                    }}
                  >
                    {mode.description}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      backgroundColor: isDark ? "#334155" : "#f3f4f6",
                      borderRadius: 8,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Zap size={12} color={isDark ? "#94a3b8" : "#6b7280"} />
                    <Text
                      style={{
                        marginLeft: 6,
                        fontSize: 12,
                        color: isDark ? "#94a3b8" : "#6b7280",
                        fontWeight: "500",
                      }}
                    >
                      {mode.stats}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );

          return (
            <View
              key={mode.id}
              style={{
                marginBottom: 16,
                width: Dimensions.get("window").width - 32,
              }}
            >
              {modeCard}
            </View>
          );
        })}

        {/* Info Card */}
        <View
          style={{
            marginTop: 8,
            backgroundColor: isDark ? "#1e293b" : "#f0f9ff",
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: isDark ? "#334155" : "#bae6fd",
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: isDark ? "#06B6D4" : "#0891B2",
              marginBottom: 8,
            }}
          >
            Track Your Progress
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#94a3b8" : "#64748b",
              lineHeight: 20,
            }}
          >
            All your test results are saved automatically. Review your
            performance and identify areas for improvement in your profile.
          </Text>
        </View>
      </ScrollView>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      {/* <GetPremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      /> */}
    </SafeAreaView>
  );
}

// import { useState } from "react";
// import { ScrollView, Text, TouchableOpacity, View, Animated } from "react-native";
// import { useRouter } from "expo-router";
// import { BookOpen, GraduationCap, Heart, X } from "lucide-react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useAuth } from "@/context/AuthContext";
// import { LoginRequiredModal } from "@/components/modals/LoginRequiredModal";
// import { GetPremiumModal } from "@/components/modals/GetPremiumModal";

// export default function QuizzesPage() {
//   const router = useRouter();
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [showPremiumModal, setShowPremiumModal] = useState(false);
//   const { token, user } = useAuth();

//   const handleModeSelect = (mode: string) => {
//     if (mode === "exam") {
//       router.push("/tests/exams" as any);
//       return;
//     }

//     if (!token || !user) {
//       setShowLoginModal(true);
//       return;
//     }

//     switch (mode) {
//       case "learn_by_topics":
//         router.push("/tests/by-topic" as any);
//         return;
//     }

//     if (!user.isPro) {
//       router.push('/payment');
//       return;
//     }

//     switch (mode) {
//       case "saved":
//         router.push("/tests/saved" as any);
//         break;
//       case "wrong":
//         router.push("/tests/wrong" as any);
//         break;
//       case "improve":
//         router.push("/tests/improve" as any);
//         break;
//       default:
//         break;
//     }
//   };

//   const modes = [
//     {
//       id: "exam",
//       title: "Full SAT Test",
//       description: "Official 60-minute mock SAT with real test conditions.",
//       icon: GraduationCap,
//       isFree: true,
//       colors: ["#2563eb", "#1e40af"], // deep blue gradient
//       buttonText: "Start Test",
//     },
//     {
//       id: "learn_by_topics",
//       title: "Practice by Section",
//       description: "Focus on Math, Reading, or Writing to improve faster.",
//       icon: BookOpen,
//       isFree: true,
//       colors: ["#3b82f6", "#8b5cf6"], // blue–purple
//       buttonText: "Go to Practice",
//     },
//     // {
//     //     id: "improve",
//     //     title: "Personalized Practice",
//     //     description: "Adaptive tasks tailored to your mistakes to help you improve efficiently.",
//     //     icon: ChartNoAxesCombined,
//     //     isFree: true,
//     //     colors: ["#22d3ee", "#0ea5e9"], // teal gradient
//     //     buttonText: "Start Personalized Practice",
//     // },
//     {
//       id: "saved",
//       title: "Saved",
//       description: "Review questions you marked for later.",
//       icon: Heart,
//       isFree: false,
//       colors: ["#8b5cf6", "#7c3aed"], // purple
//       buttonText: "View Saved",
//     },
//     {
//       id: "wrong",
//       title: "Mistakes",
//       description: "Revisit the questions you answered wrong",
//       icon: X,
//       isFree: false,
//       colors: ["#f43f5e", "#be123c"], // pink–red
//       buttonText: "Review Now",
//     },
//   ];

//   type ModeType = (typeof modes)[number];

//   const ModeCard = ({ mode, fullWidth }: { mode: ModeType; fullWidth?: boolean }) => {
//     const Icon = mode.icon;
//     const [scale] = useState(new Animated.Value(1));

//     const handlePressIn = () => {
//       Animated.spring(scale, {
//         toValue: 0.97,
//         useNativeDriver: true,
//       }).start();
//     };
//     const handlePressOut = () => {
//       Animated.spring(scale, {
//         toValue: 1,
//         friction: 3,
//         tension: 40,
//         useNativeDriver: true,
//       }).start();
//     };

//     return (
//       <Animated.View style={{ transform: [{ scale }], flex: 1}}>
//         <TouchableOpacity
//           activeOpacity={0.9}
//           onPress={() => handleModeSelect(mode.id)}
//           onPressIn={handlePressIn}
//           onPressOut={handlePressOut}
//           className="m-2 rounded-3xl overflow-hidden shadow-lg shadow-black/25"
//         >
//           <LinearGradient
//             colors={mode.colors as [string, string]}
//             start={[0, 0]}
//             end={[1, 1]}
//             style={{ padding: 20 }}
//           >
//             <View className="flex-row items-center mb-3">
//               <Icon size={26} color="#fff" />
//               <Text className="text-white font-extrabold text-lg ml-2">
//                 {mode.title}
//               </Text>
//             </View>

//             <Text className="text-white/90 text-sm mb-4">{mode.description}</Text>

//             <View className="bg-white/90 py-2 rounded-lg">
//               <Text className="text-center text-black font-semibold">
//                 {!user ? "Sign In" : mode.isFree ||
//                 user.isPro ? mode.buttonText : "👑 PRO"}
//               </Text>
//             </View>
//           </LinearGradient>
//         </TouchableOpacity>
//       </Animated.View>
//     );
//   };

//   const byTopicMode = modes.find((m) => m.id === "learn_by_topics");
//   const examMode = modes.find((m) => m.id === "exam");
//   const improveMode = modes.find((m) => m.id === "improve");
//   const sideModes = modes.filter((m) => ["saved", "wrong"].includes(m.id));

//   return (
//     <SafeAreaView className="flex-1 bg-[#f8fafc] dark:bg-[#0f172a] pt-2">

//       <ScrollView
//         className="flex-1 px-3"
//         contentContainerStyle={{ paddingBottom: 220 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <View className="mb-4">
//           <Text className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 text-center">
//             SAT Practice 2025
//           </Text>
//           <Text className="text-sm text-gray-600 dark:text-stone-400 text-center mt-2">
//             Updated recently • Smart prep for your success
//           </Text>
//         </View>

//         {byTopicMode && <ModeCard mode={byTopicMode} fullWidth />}

//         {improveMode && <ModeCard mode={improveMode} fullWidth />}

//         <View className="flex-row justify-between mb-6">
//           {sideModes.map((mode) => (
//             <ModeCard key={mode.id} mode={mode} />
//           ))}
//         </View>
//       </ScrollView>

//       {examMode && (
//         <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1e293b] px-6 py-6 border-t border-gray-200 dark:border-stone-700 pb-36">
//           <View className="flex-row items-start gap-3 mb-3">
//             <examMode.icon size={28} color="#2563eb" />
//             <View className="flex-1">
//               <Text className="text-blue-600 dark:text-blue-400 font-bold text-2xl">
//                 {examMode.title}
//               </Text>
//               <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
//                 Simulate the real SAT with full timing & sections.
//               </Text>
//             </View>
//           </View>

//           <TouchableOpacity
//             onPress={() => handleModeSelect("exam")}
//             activeOpacity={0.9}
//             className="rounded-2xl overflow-hidden shadow-md shadow-blue-400/30"
//           >
//             <LinearGradient
//               colors={examMode.colors as [string, string]}
//               start={[0, 0]}
//               end={[1, 1]}
//               style={{ paddingVertical: 14 }}
//             >
//               <Text className="text-white font-semibold text-center text-base">
//                 {examMode.buttonText}
//               </Text>
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       )}

//       <LoginRequiredModal
//         isOpen={showLoginModal}
//         onClose={() => setShowLoginModal(false)}
//       />
//     </SafeAreaView>
//   );
// }
