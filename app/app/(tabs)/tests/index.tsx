import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, Animated } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, GraduationCap, Heart, X, Dices, Dot, ChartNoAxesCombined } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import TopBlur from "@/components/ui/TobBlur";
import { LoginRequiredModal } from "@/components/modals/LoginRequiredModal";
import { GetPremiumModal } from "@/components/modals/GetPremiumModal";

export default function TestsPage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { token, user } = useAuth();

  const handleModeSelect = (mode: string) => {
    if (mode === "exam") {
      router.push("/tests/exam" as any);
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
      setShowPremiumModal(true);
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
      description: "Official 60-minute mock SAT with real test conditions.",
      icon: GraduationCap,
      isFree: true,
      colors: ["#2563eb", "#1e40af"], // deep blue gradient
      buttonText: "Start Test",
    },
    {
      id: "learn_by_topics",
      title: "Practice by Section",
      description: "Focus on Math, Reading, or Writing to improve faster.",
      icon: BookOpen,
      isFree: true,
      colors: ["#3b82f6", "#8b5cf6"], // blue–purple
      buttonText: "Go to Practice",
    },
    {
        id: "improve",
        title: "Personalized Practice",
        description: "Adaptive tasks tailored to your mistakes to help you improve efficiently.",
        icon: ChartNoAxesCombined,
        isFree: true,
        colors: ["#22d3ee", "#0ea5e9"], // teal gradient
        buttonText: "Start Personalized Practice",  
    },
    {
      id: "saved",
      title: "Saved",
      description: "Review questions you marked for later.",
      icon: Heart,
      isFree: false,
      colors: ["#8b5cf6", "#7c3aed"], // purple
      buttonText: "View Saved",
    },
    {
      id: "wrong",
      title: "Mistakes",
      description: "Revisit the questions you answered wrong",
      icon: X,
      isFree: false,
      colors: ["#f43f5e", "#be123c"], // pink–red
      buttonText: "Review Now",
    },
  ];

  type ModeType = (typeof modes)[number];

  const ModeCard = ({ mode, fullWidth }: { mode: ModeType; fullWidth?: boolean }) => {
    const Icon = mode.icon;
    const [scale] = useState(new Animated.Value(1));

    const handlePressIn = () => {
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
      }).start();
    };
    const handlePressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale }], flex: 1}}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleModeSelect(mode.id)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="m-2 rounded-3xl overflow-hidden shadow-lg shadow-black/25"
        >
          <LinearGradient
            colors={mode.colors as [string, string]}
            start={[0, 0]}
            end={[1, 1]}
            style={{ padding: 20 }}
          >
            <View className="flex-row items-center mb-3">
              <Icon size={26} color="#fff" />
              <Text className="text-white font-extrabold text-lg ml-2">
                {mode.title}
              </Text>
            </View>

            <Text className="text-white/90 text-sm mb-4">{mode.description}</Text>

            <View className="bg-white/90 py-2 rounded-lg">
              <Text className="text-center text-black font-semibold">
                {!user ? "Sign In" : mode.isFree || user.isPro ? mode.buttonText : "👑 PRO"}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const byTopicMode = modes.find((m) => m.id === "learn_by_topics");
  const examMode = modes.find((m) => m.id === "exam");
  const improveMode = modes.find((m) => m.id === "improve");
  const sideModes = modes.filter((m) => ["saved", "wrong"].includes(m.id));

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc] dark:bg-[#0f172a] pt-2">
      
      <ScrollView
        className="flex-1 px-3"
        contentContainerStyle={{ paddingBottom: 220 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4">
          <Text className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 text-center">
            SAT Practice 2025
          </Text>
          <Text className="text-sm text-gray-600 dark:text-stone-400 text-center mt-2">
            Updated recently • Smart prep for your success
          </Text>
        </View>

        {/* Practice by Section */}
        {byTopicMode && <ModeCard mode={byTopicMode} fullWidth />}

        {/* Improve / Practice full width */}
        {improveMode && <ModeCard mode={improveMode} fullWidth />}

        {/* Saved & Wrong side by side */}
        <View className="flex-row justify-between mb-6">
          {sideModes.map((mode) => (
            <ModeCard key={mode.id} mode={mode} />
          ))}
        </View>
      </ScrollView>

      {/* Full Test Button at Bottom */}
      {examMode && (
        <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1e293b] px-6 py-6 border-t border-gray-200 dark:border-stone-700 pb-36">
          <View className="flex-row items-start gap-3 mb-3">
            <examMode.icon size={28} color="#2563eb" />
            <View className="flex-1">
              <Text className="text-blue-600 dark:text-blue-400 font-bold text-2xl">
                {examMode.title}
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Simulate the real SAT with full timing & sections.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => handleModeSelect("exam")}
            activeOpacity={0.9}
            className="rounded-2xl overflow-hidden shadow-md shadow-blue-400/30"
          >
            <LinearGradient
              colors={examMode.colors as [string, string]}
              start={[0, 0]}
              end={[1, 1]}
              style={{ paddingVertical: 14 }}
            >
              <Text className="text-white font-semibold text-center text-base">
                {examMode.buttonText}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <GetPremiumModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </SafeAreaView>
  );
}
