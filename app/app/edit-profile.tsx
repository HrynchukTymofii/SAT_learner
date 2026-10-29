import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/lib/api/user";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useColorScheme } from "@/hooks/useColorScheme";

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
  { type: "passionSelect", title: "What's your passion?", key: "passion" },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { token, user, setUser } = useAuth();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    <View style={{ flex: 1, backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9" }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 12,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: isDark ? "#0B0A0F" : "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "#17151C" : "#E5DFEE",
      }}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isDark ? "#17151C" : "#EFEAF7",
            borderRadius: 12,
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={isDark ? "#C9AAFB" : "#7A4BDB"} />
          <Text style={{ color: isDark ? "#C9AAFB" : "#7A4BDB", fontWeight: "600", marginLeft: 6, fontSize: 14 }}>
            Back
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={{ fontSize: 24, fontWeight: "bold", color: isDark ? "#F4F1F8" : "#0B0A0F", marginBottom: 4 }}>
          Edit Profile
        </Text>
        <Text style={{ fontSize: 14, color: isDark ? "#9C95A8" : "#6B6577" }}>
          Update your account information
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {steps.map((step) => (
          <View key={step.key} style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: isDark ? "#F4F1F8" : "#0B0A0F",
                marginBottom: 8,
              }}
            >
              {step.title}
            </Text>

            {/* Text Input */}
            {step.type === "text" && (
              <TextInput
                placeholder="Enter..."
                value={answers[step.key]}
                onChangeText={(text) => handleAnswer(step.key, text)}
                style={{
                  backgroundColor: isDark ? "#17151C" : "#ffffff",
                  color: isDark ? "#F4F1F8" : "#0B0A0F",
                  borderColor: isDark ? "#2B2733" : "#E5DFEE",
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                }}
                placeholderTextColor={isDark ? "#7E7889" : "#9C95A8"}
              />
            )}

            {/* Select Options */}
            {step.type === "select" && (
              <View
                style={{
                  backgroundColor: isDark ? "#17151C" : "#ffffff",
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#2B2733" : "#E5DFEE",
                }}
              >
                {step.options?.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      marginBottom: 8,
                      backgroundColor:
                        answers[step.key] === option
                          ? "#8A5CE6"
                          : "transparent",
                    }}
                    onPress={() => handleAnswer(step.key, option)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        color:
                          answers[step.key] === option ? "#ffffff" : (isDark ? "#F4F1F8" : "#0B0A0F"),
                        fontWeight: answers[step.key] === option ? "600" : "400",
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
              <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                {["👩‍🎓", "🧑‍🎓", "🎓"].map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      borderWidth: 3,
                      borderColor: answers[step.key] === emoji ? "#8A5CE6" : (isDark ? "#2B2733" : "#E5DFEE"),
                      backgroundColor: answers[step.key] === emoji ? "#8A5CE610" : (isDark ? "#17151C" : "#ffffff"),
                    }}
                    onPress={() => handleAnswer(step.key, emoji)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 40 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Date Picker */}
            {step.type === "timepicker" && (
              <View>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={{
                    backgroundColor: isDark ? "#17151C" : "#ffffff",
                    borderWidth: 1,
                    borderColor: isDark ? "#2B2733" : "#E5DFEE",
                    padding: 16,
                    borderRadius: 12,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    color: answers[step.key] ? (isDark ? "#F4F1F8" : "#0B0A0F") : (isDark ? "#7E7889" : "#9C95A8"),
                    fontSize: 16,
                  }}>
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
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {passionsList.map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => handleAnswer(step.key, p)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: answers[step.key] === p ? "#8A5CE6" : (isDark ? "#17151C" : "#ffffff"),
                      borderWidth: 1,
                      borderColor: answers[step.key] === p ? "#8A5CE6" : (isDark ? "#2B2733" : "#E5DFEE"),
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        color: answers[step.key] === p ? "#ffffff" : (isDark ? "#F4F1F8" : "#0B0A0F"),
                        fontWeight: answers[step.key] === p ? "600" : "400",
                      }}
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
        <TouchableOpacity
          onPress={handleSave}
          style={{
            backgroundColor: "#8A5CE6",
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
            Save Changes
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
