import { Platform, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { Calendar, Check, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { updateUser } from "@/lib/api/user";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Fonts, usePalette } from "@/constants/palette";
import { Chip, Field, PillButton, Screen, T, Tap, TopBar } from "@/components/ds";

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


export default function EditProfileScreen() {
  const router = useRouter();
  const c = usePalette();
  const { token, user, setUser } = useAuth();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load stored answers
  useEffect(() => {
    const loadAnswers = async () => {
      const stored = await SecureStore.getItemAsync("onboardingAnswers");
      if (stored) setAnswers(JSON.parse(stored));
      else setAnswers({ name: user?.name || "" });
    };
    loadAnswers();
  }, [user]);

  const handleAnswer = (key: string, value: string) => setAnswers((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!token) return;
    if (!answers.name?.trim()) {
      Toast.show({ type: "error", text1: "Please enter your name" });
      return;
    }
    setSaving(true);
    const result = await updateUser(token, { name: answers.name.trim() });
    setSaving(false);
    if (result.success) {
      if (user) setUser({ ...user, name: answers.name.trim() });
      await SecureStore.setItemAsync("onboardingAnswers", JSON.stringify(answers));
      Toast.show({ type: "success", text1: "Profile updated" });
      router.back();
    } else {
      Toast.show({ type: "error", text1: result.error || "Couldn't save your profile" });
    }
  };

  const satDate = answers.satDate ? new Date(answers.satDate) : null;
  const satLabel = satDate && !isNaN(satDate.getTime()) ? satDate.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" }) : null;

  return (
    <Screen header={<TopBar title="Edit profile" />} footer={<PillButton title="Save changes" icon={Check} loading={saving} onPress={handleSave} />}>
      <Section title="Avatar">
        <View style={{ flexDirection: "row", gap: 12 }}>
          {["👩‍🎓", "🧑‍🎓", "🎓"].map((emoji, i) => {
            const on = answers.avatar === emoji;
            return (
              <Tap
                key={emoji}
                onPress={() => handleAnswer("avatar", emoji)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: [c.butter, c.lav, c.mint][i],
                  borderWidth: 3,
                  borderColor: on ? c.ink : "transparent",
                }}
              >
                <Text style={{ fontSize: 32 }}>{emoji}</Text>
              </Tap>
            );
          })}
        </View>
      </Section>

      <Field label="Name" icon={User} value={answers.name ?? ""} onChangeText={(t) => handleAnswer("name", t)} placeholder="Your name" autoCapitalize="words" />

      <Section title="Have you taken the SAT before?">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {["Never", "Once", "Multiple times"].map((o) => (
            <Chip key={o} label={o} active={answers.satExperience === o} onPress={() => handleAnswer("satExperience", o)} />
          ))}
        </View>
      </Section>

      <Section title="When is your SAT?">
        <Tap
          onPress={() => setShowDatePicker(true)}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: c.surface,
            borderWidth: 1.5,
            borderColor: c.line,
            borderRadius: 999,
            paddingHorizontal: 16,
            height: 54,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Calendar size={19} color={c.muted} />
          <Text style={{ flex: 1, fontFamily: Fonts.bodySemi, fontSize: 15.5, color: satLabel ? c.ink : c.subtle }}>{satLabel ?? "Pick a date"}</Text>
        </Tap>
        {showDatePicker && (
          <DateTimePicker
            mode="date"
            value={satDate && !isNaN(satDate.getTime()) ? satDate : new Date()}
            minimumDate={new Date()}
            display={Platform.OS === "ios" ? "inline" : "default"}
            themeVariant={c.isDark ? "dark" : "light"}
            accentColor={c.brand}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === "ios" && event.type !== "dismissed" ? true : false);
              // ISO, the same format onboarding saves and Home reads for the countdown
              if (date && event.type !== "dismissed") handleAnswer("satDate", date.toISOString());
              if (Platform.OS === "ios" && event.type === "set") setShowDatePicker(false);
            }}
          />
        )}
      </Section>

      <Section title="What are you into?">
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {passionsList.map((p) => (
            <Chip key={p} label={p} active={answers.passion === p} onPress={() => handleAnswer("passion", p)} />
          ))}
        </View>
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10 }}>
      <T variant="label">{title}</T>
      {children}
    </View>
  );
}
