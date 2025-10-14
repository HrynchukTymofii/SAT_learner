import { View, Text, Image, Animated } from "react-native";
import * as Progress from "react-native-progress";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBlur from "./TobBlur";
import { useColorScheme } from "@/hooks/useColorScheme";

const phrases = [
  "Preparing your SAT prep environment…",
  "Almost ready!",
  "Stay focused!",
  "Loading questions…",
  "Just a moment…"
];

export default function CustomPreloadScreen() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const animate = () => {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    };

    animate();

    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      animate();
    }, 3000);

    return () => clearInterval(interval);
  }, [fadeAnim]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0f172a" : "#f8fafc", paddingTop: 2 }}
    >
      <TopBlur />

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={{ width: 160, height: 160, borderRadius: 80 }}
          resizeMode="contain"
        />

        <Text
          style={{
            marginTop: 24,
            fontSize: 30,
            fontWeight: "bold",
            color: "#2563eb",
            textAlign: "center",
          }}
        >
          SAT Practice 2025
        </Text>

        <Animated.Text
          style={{
            opacity: fadeAnim,
            marginTop: 12,
            fontSize: 16,
            color: isDark ? "#cbd5e1" : "#4b5563",
            textAlign: "center",
          }}
        >
          {phrases[currentPhraseIndex]}
        </Animated.Text>

        <View style={{ marginTop: 32, alignItems: "center" }}>
          <Progress.Bar
            progress={1}
            indeterminate
            width={260}
            color="#2563eb"
            borderRadius={10}
          />
        </View>
      </View>

      <PreloadFooter isDark={isDark} />
    </SafeAreaView>
  );
}

function getYesterdayString() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
}

function PreloadFooter({ isDark }: { isDark: boolean }) {
  const yesterdayStr = getYesterdayString();
  return (
    <View style={{ paddingBottom: 32 }}>
      <Text
        style={{
          fontSize: 12,
          color: isDark ? "#94a3b8" : "#6b7280",
          textAlign: "center",
        }}
      >
        Last updated: {yesterdayStr}
      </Text>
    </View>
  );
}
