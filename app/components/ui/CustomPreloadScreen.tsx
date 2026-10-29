import { View, Text, Image, Animated, useColorScheme as useSystemColorScheme } from "react-native";
import * as Progress from "react-native-progress";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import TopBlur from "./TobBlur";

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
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useSystemColorScheme();
  const isDark = colorScheme === "dark";
  // useEffect(() => {
  //   console.log("🧠 TestsPage mounted");

  //   return () => {
  //     console.log("🧹 TestsPage unmounted");
  //   };
  // }, []);

  useEffect(() => {
    // Fade animation for text
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

  useEffect(() => {
    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation for gradient ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [pulseAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0B0A0F" : "#ffffff", paddingTop: 2 }}
    >
      <TopBlur />

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        {/* Animated gradient ring behind logo */}
        <Animated.View
          style={{
            position: "absolute",
            transform: [{ rotate: spin }, { scale: pulseAnim }],
          }}
        >
          <LinearGradient
            colors={["#8A5CE6", "#8A5CE6", "#8A5CE6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              opacity: 0.3,
            }}
          />
        </Animated.View>

        {/* Outer glow circle */}
        <View
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: 110,
            backgroundColor: isDark ? "#C9AAFB20" : "#7A4BDB15",
          }}
        />

        {/* Logo with pulse animation */}
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <View
            style={{
              width: 170,
              height: 170,
              borderRadius: 85,
              backgroundColor: isDark ? "#17151C" : "#F4F1F9",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#8A5CE6",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Image
              source={require("@/assets/images/splash-icon-white.png")}
              style={{ width: 140, height: 140, borderRadius: 70 }}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Title with gradient */}
        <LinearGradient
          colors={["#8A5CE6", "#8A5CE6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            marginTop: 40,
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 16,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            SAT Math Learner
          </Text>
        </LinearGradient>

        {/* Animated phrase */}
        <Animated.Text
          style={{
            opacity: fadeAnim,
            marginTop: 20,
            fontSize: 16,
            color: isDark ? "#9C95A8" : "#6B6577",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          {phrases[currentPhraseIndex]}
        </Animated.Text>

        {/* Progress bar with gradient */}
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <Progress.Bar
            progress={1}
            indeterminate
            width={280}
            color="#8A5CE6"
            unfilledColor={isDark ? "#17151C" : "#E5DFEE"}
            borderWidth={0}
            borderRadius={12}
            height={8}
          />
        </View>

        {/* Decorative dots */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 24 }}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#8A5CE6",
                opacity: fadeAnim,
              }}
            />
          ))}
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
          color: isDark ? "#9C95A8" : "#6B6577",
          textAlign: "center",
        }}
      >
        Last updated: {yesterdayStr}
      </Text>
    </View>
  );
}
