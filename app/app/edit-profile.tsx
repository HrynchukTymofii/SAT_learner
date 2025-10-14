import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, User } from "lucide-react-native";
import TopBlur from "@/components/ui/TobBlur";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/lib/api/user";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import DateTimePicker from "@react-native-community/datetimepicker";

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

const steps = [
  { type: "text", title: "Change Name", key: "name" },
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
  { type: "avatar", title: "Pick an avatar", key: "avatar" },
  {
    type: "select",
    title: "Most difficult part for you?",
    options: ["Math", "Reading", "Writing", "Time management"],
    key: "difficulty",
  },
  { type: "passionSelect", title: "What's your passion?", key: "passion" },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { token, user, setUser } = useAuth();
  const { colorScheme } = useColorScheme() as {
    colorScheme: "light" | "dark";
    setColorScheme: any;
  };

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const inputBg = colorScheme === "dark" ? "#1e293b" : "#f1f5f9";
  const inputText = colorScheme === "dark" ? "#f1f5f9" : "#1f2937";
  const placeholderText = colorScheme === "dark" ? "#9ca3af" : "#6b7280";
  const sectionTitle = colorScheme === "dark" ? "#f1f5f9" : "#1f2937";

  // Load stored answers
  useEffect(() => {
    const loadAnswers = async () => {
      const stored = await SecureStore.getItemAsync("onboardingAnswers");
      if (stored) setAnswers(JSON.parse(stored));
      else setAnswers({ name: user?.name || "" });
    };
    loadAnswers();
  }, [user]);

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!token) return alert("User not authorized");
    const result = await updateUser(token, { name: answers.name });
    if (result.success) {
      if (user) setUser({ ...user, name: answers.name });
      Toast.show({
        type: "success",
        text1: "Profile updated",
        position: "top",
        visibilityTime: 700,
      });
      router.back();
      await SecureStore.setItemAsync(
        "onboardingAnswers",
        JSON.stringify(answers)
      );
    } else {
      alert(result.error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc] dark:bg-[#0f172a]">
      {colorScheme !== "dark" && <TopBlur />}

      {/* Back Button */}
     <LinearGradient
        colors={["#3b82f6", "#2563eb"]}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5,
          alignSelf: "flex-start",
          marginLeft: 8,
          marginVertical: 12
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/profile")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 6,
          }}
        >
          <ArrowLeft size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
            Back
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 12 }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: colorScheme === "dark" ? "#60a5fa" : "#2563eb",
            marginBottom: 16,
          }}
        >
          Edit Profile
        </Text>

        {steps.map((step) => (
          <View key={step.key} className="mb-6">
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: sectionTitle,
                marginBottom: 6,
              }}
            >
              {step.title}
            </Text>

            {/* Text Input */}
            {step.type === "text" && (
              <TextInput
                className="rounded-xl px-3 py-2 text-base"
                placeholder="Enter..."
                value={answers[step.key]}
                onChangeText={(text) => handleAnswer(step.key, text)}
                style={{
                  backgroundColor: inputBg,
                  color: inputText,
                  borderColor: colorScheme === "dark" ? "#334155" : "#e2e8f0",
                  borderWidth: 1,
                }}
                placeholderTextColor={placeholderText}
              />
            )}

            {/* Select Options */}
            {step.type === "select" && (
              <View
                style={{
                  backgroundColor: inputBg,
                  borderRadius: 16,
                  padding: 12,
                }}
              >
                {step.options?.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 12,
                      marginBottom: 6,
                      backgroundColor:
                        answers[step.key] === option
                          ? "#3b82f6"
                          : "transparent",
                    }}
                    onPress={() => handleAnswer(step.key, option)}
                  >
                    <Text
                      style={{
                        color:
                          answers[step.key] === option ? "#fff" : inputText,
                      }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Avatar Picker */}
            {step.type === "avatar" && (
              <View className="flex-row items-center gap-8 mb-2">
                {["👩‍🎓", "🧑‍🎓", "🎓"].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    className={`p-4 px-5 rounded-full border-2 ${answers[step.key] === emoji ? "border-yellow-400 bg-white/30" : "border-white/40"}`}
                    onPress={() => handleAnswer(step.key, emoji)}
                  >
                    <Text style={{ fontSize: 36 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Date Picker */}
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
                    value={
                      answers[step.key]
                        ? new Date(answers[step.key])
                        : new Date()
                    }
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) handleAnswer(step.key, date.toDateString());
                    }}
                  />
                )}
              </View>
            )}

            {/* Passion Input */}
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
          </View>
        ))}

        {/* Save Button */}
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          start={[0, 0]}
          end={[1, 1]}
          style={{ borderRadius: 16, overflow: "hidden" }}
        >
          <TouchableOpacity
            onPress={handleSave}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 12,
            }}
            activeOpacity={0.9}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
              Save Changes
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}
