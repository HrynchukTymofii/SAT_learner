import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { MotiText } from "moti";
import DateTimePicker from "@react-native-community/datetimepicker";

type OnboardingStep = {
  type:
    | "welcome"
    | "text"
    | "avatar"
    | "select"
    | "timepicker"
    | "passionSelect"
    | "loginRedirect";
  title: string;
  description?: string;
  key: string;
  placeholder?: string;
  options?: string[];
};

const passionsList = [
  "Science",
  "Technology",
  "Art",
  "Music",
  "Sports",
  "Literature",
  "History",
  "Business",
  "Medicine",
  "Engineering",
  "Travel",
  "Languages",
  "Other",
];

const onboardingQuestions: OnboardingStep[] = [
  {
    type: "welcome",
    title: "Welcome to SAT Prep",
    description: "Let's personalize your journey with a few quick questions.",
    key: "welcome",
  },
  {
    type: "text",
    title: "What's your name?",
    placeholder: "Enter your name",
    key: "name",
  },
  { type: "avatar", title: "Pick an avatar", key: "avatar" },
  {
    type: "select",
    title: "Have you tried SAT before?",
    options: ["Never", "Once", "Multiple times"],
    key: "satExperience",
  },
  {
    type: "timepicker",
    title: "When do you plan to take the SAT?",
    key: "satDate",
  },
  {
    type: "select",
    title: "Most difficult part for you?",
    options: ["Math", "Reading", "Writing", "Time management"],
    key: "difficulty",
  },
  {
    type: "passionSelect",
    title: "What's your passion?",
    key: "passion",
  },
  {
    type: "loginRedirect",
    title: "You're all set! 🎉",
    description: "Final step: create your account to begin your journey.",
    key: "gotoRegister",
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(20))[0];

  const step = onboardingQuestions[currentStep];
  const totalSteps = onboardingQuestions.length;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      setCurrentStep(currentStep + 1);
    } else {
      try {
        await SecureStore.setItemAsync("onboardingCompleted", "true");
        
        await SecureStore.setItemAsync("onboardingAnswers", JSON.stringify(answers));

        router.push({ pathname: "/login", params: { tab: "register" } });
      } catch (err) {
        console.error("Error saving onboarding data:", err);
        router.push({ pathname: "/login", params: { tab: "register" } });
      }
    }
  };

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <LinearGradient
      colors={["#1e3a8a", "#3b82f6", "#60a5fa"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}

    >
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        {/* Progress Bar */}
        <View className="w-full h-2 bg-white/20 rounded-full mb-8 overflow-hidden">
          <View
            style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: "white",
            }}
          />
        </View>

        {/* Step Content */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <MotiText
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 100 }}
            className="text-3xl font-extrabold text-white text-center mb-3"
          >
            {step.title}
          </MotiText>

          {step.description && (
            <MotiText
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 150 }}
              className="text-center text-white/90 mb-8 text-base"
            >
              {step.description}
            </MotiText>
          )}

          {/* Text Input (Glass style) */}
          {step.type === "text" && (
            <View className="bg-white/15 rounded-2xl mb-6 ">
              <TextInput
                className="bg-white/20 rounded-2xl text-white px-4 py-3 text-base"
                placeholder={step.placeholder}
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={answers[step.key] || ""}
                onChangeText={(text) => handleAnswer(step.key, text)}
              />
            </View>
          )}

          {/* Avatar Selection */}
          {step.type === "avatar" && (
            <View className="flex-row items-center gap-8 mb-6 mx-auto">
              {["👩‍🎓", "🧑‍🎓", "🎓"].map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  className={`p-4 px-5 rounded-full border-2 ${
                    answers[step.key] === emoji
                      ? "border-yellow-400 bg-white/30"
                      : "border-white/40"
                  }`}
                  onPress={() => handleAnswer(step.key, emoji)}
                >
                  <Text style={{ fontSize: 36 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Select Options */}
          {step.type === "select" &&
            step.options?.map((opt) => (
              <TouchableOpacity
                key={opt}
                className={`p-4 mb-3 rounded-xl ${
                  answers[step.key] === opt
                    ? "bg-white"
                    : "bg-white/20 border border-white/30"
                }`}
                onPress={() => handleAnswer(step.key, opt)}
              >
                <Text
                  className={`text-center ${
                    answers[step.key] === opt
                      ? "text-blue-600 font-bold"
                      : "text-white"
                  }`}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}

          {/* Time Picker */}
          {step.type === "timepicker" && (
            <View className="items-center">
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-white/20 border border-white/30 p-4 rounded-xl mb-4"
              >
                <Text className="text-white text-center">
                  {answers[step.key]
                    ? `📅 ${answers[step.key]}`
                    : "Select your exam date"}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  mode="date"
                  value={new Date()}
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      handleAnswer(step.key, date.toDateString());
                    }
                  }}
                />
              )}
            </View>
          )}

          {/* Passion Select */}
          {step.type === "passionSelect" && (
            <View className="flex flex-wrap flex-row justify-center gap-3 mb-6">
              {passionsList.map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => handleAnswer(step.key, p)}
                  className={`px-4 py-2 rounded-full ${
                    answers[step.key] === p
                      ? "bg-white"
                      : "bg-white/20 border border-white/30"
                  }`}
                >
                  <Text
                    className={`${
                      answers[step.key] === p
                        ? "text-blue-600 font-bold"
                        : "text-white"
                    }`}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Next Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleNext}
            className="rounded-2xl overflow-hidden shadow-lg mt-6"
          >
            <LinearGradient
              colors={["#f59e0b", "#fbbf24"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 14 }}
            >
              <Text className="text-center text-white font-semibold text-base">
                {currentStep === totalSteps - 1 ? "Go to Register" : "Next"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
      <View className="items-center justify-center py-6 mb-12">
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          activeOpacity={0.8}
        >
          <Text className="text-white/80 text-sm font-semibold mt-1 underline underline-offset-4">
            Already have an account? Log in
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
