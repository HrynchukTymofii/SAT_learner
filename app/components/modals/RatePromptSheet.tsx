import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Pressable, ActivityIndicator, Platform } from "react-native";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import * as StoreReview from "expo-store-review";
import Svg, { Path } from "react-native-svg";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/context/AuthContext";
import { sendMessage } from "@/lib/api/user";
import { markDismissed, markRated, onRatePrompt, type RateSource } from "@/lib/ratePrompt";

const CYAN = "#8A5CE6";
const GREEN = "#2E9A5E";
const AMBER = "#E5A50A";
const STAR_WORDS = ["Bad", "Could be better", "Okay", "Good", "Great!"];
const REASONS = ["Mistakes in questions", "App bugs", "Too expensive", "Hard to use", "Something else"];

// Rating sheet, mounted once in the root layout and opened through lib/ratePrompt
// (ported from PDR_ua). 4-5 stars go to the store's own review dialog; 1-3 stars
// stay in the app as feedback.
export default function RatePromptSheet() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === "dark";
  const c = {
    sheet: dark ? "#0B0A0F" : "#ffffff",
    text: dark ? "#F4F1F8" : "#0B0A0F",
    muted: dark ? "#9C95A8" : "#6B6577",
    border: dark ? "#2B2733" : "#E5DFEE",
    handle: dark ? "#2B2733" : "#D9D2E5",
  };

  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<"stars" | "feedback">("stars");
  const [stars, setStars] = useState(0);
  const [reasons, setReasons] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const sourceRef = useRef<RateSource>("profile_button");
  // What to do once the sheet has slid away
  const afterHideRef = useRef<(() => void) | null>(null);

  useEffect(
    () =>
      onRatePrompt((source) => {
        sourceRef.current = source;
        setStep("stars");
        setStars(0);
        setReasons([]);
        setText("");
        setVisible(true);
      }),
    []
  );

  const close = (after?: () => void) => {
    afterHideRef.current = after ?? null;
    setVisible(false);
  };

  // Closed without rating: ask again later (not counted when opened by hand)
  const dismiss = () => {
    if (step === "stars" && sourceRef.current !== "profile_button") markDismissed();
    close();
  };

  const pickStars = (n: number) => {
    if (stars) return;
    setStars(n);
    // Any rating counts: the prompt never shows again
    markRated();
    // Let the stars fill before moving on
    setTimeout(() => {
      if (n >= 4) {
        close(async () => {
          try {
            if (await StoreReview.isAvailableAsync()) await StoreReview.requestReview();
          } catch (err) {
            console.warn("Error requesting review:", err);
          }
        });
      } else {
        setStep("feedback");
      }
    }, 650);
  };

  const toggleReason = (label: string) =>
    setReasons((r) => (r.includes(label) ? r.filter((k) => k !== label) : [...r, label]));

  const send = async () => {
    if (!reasons.length && !text.trim()) {
      Toast.show({ type: "info", text1: "Pick a reason or write a few words" });
      return;
    }
    if (!token) {
      Toast.show({ type: "error", text1: "Log in to send feedback" });
      return;
    }
    setSending(true);
    try {
      const fullMessage =
        `[${stars} stars]${reasons.length ? ` ${reasons.join(", ")}` : ""}\n${text.trim()}` +
        `\n\n---\nPage: mobile-app rate-app (${sourceRef.current})\nOS: ${Platform.OS} ${Platform.Version}`;
      if (await sendMessage(token, "app_feedback", fullMessage)) {
        close(() => Toast.show({ type: "success", text1: "Thanks for your feedback!" }));
      } else {
        Toast.show({ type: "error", text1: "Couldn't send your feedback", text2: "Please try again" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Couldn't send your feedback", text2: "Please try again" });
    } finally {
      setSending(false);
    }
  };

  const notNow = (
    <TouchableOpacity onPress={dismiss} activeOpacity={0.7} style={{ alignSelf: "center", marginTop: 12, paddingHorizontal: 16, paddingVertical: 8 }}>
      <Text style={{ fontSize: 14.5, fontWeight: "600", color: c.muted }}>Not now</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={dismiss}
      onBackButtonPress={dismiss}
      onSwipeComplete={dismiss}
      swipeDirection={["down"]}
      onModalHide={() => {
        afterHideRef.current?.();
        afterHideRef.current = null;
      }}
      avoidKeyboard
      style={{ justifyContent: "flex-end", margin: 0 }}
      backdropOpacity={0.5}
    >
      <View
        style={{
          backgroundColor: c.sheet,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 12) + 12,
        }}
      >
        <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 16 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: c.handle }} />
        </View>

        {step === "stars" ? (
          <Animated.View key="stars" entering={FadeIn.duration(250)}>
            <Text style={{ fontSize: 22, fontWeight: "800", textAlign: "center", color: c.text }}>
              How do you like the app?
            </Text>
            <Text style={{ fontSize: 14, textAlign: "center", color: c.muted, marginTop: 4 }}>
              Your rating helps other students find us
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 24 }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} index={n} filled={n <= stars} onPress={() => pickStars(n)} dark={dark} />
              ))}
            </View>

            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                textAlign: "center",
                marginTop: 12,
                height: 20,
                color: stars >= 4 ? GREEN : stars ? AMBER : "transparent",
              }}
            >
              {stars ? STAR_WORDS[stars - 1] : " "}
            </Text>
            {notNow}
          </Animated.View>
        ) : (
          <Animated.View key="feedback" entering={FadeInDown.duration(300)}>
            <Text style={{ fontSize: 22, fontWeight: "800", textAlign: "center", color: c.text }}>
              What should we improve?
            </Text>
            <Text style={{ fontSize: 14, textAlign: "center", color: c.muted, marginTop: 4, marginBottom: 16 }}>
              We read every message
            </Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {REASONS.map((label) => {
                const on = reasons.includes(label);
                return (
                  <Pressable
                    key={label}
                    onPress={() => toggleReason(label)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 999,
                      borderWidth: 1.5,
                      borderColor: on ? CYAN : c.border,
                      backgroundColor: on ? (dark ? "#083344" : "#EFE4FF") : c.sheet,
                    }}
                  >
                    <Text style={{ fontSize: 13.5, fontWeight: "600", color: on ? (dark ? "#C9AAFB" : "#7A4BDB") : c.text }}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              multiline
              value={text}
              onChangeText={setText}
              placeholder="Tell us what went wrong (optional)"
              placeholderTextColor={c.muted}
              editable={!sending}
              style={{
                borderWidth: 1.5,
                borderColor: c.border,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 12,
                fontSize: 15,
                color: c.text,
                backgroundColor: c.sheet,
                minHeight: 96,
                textAlignVertical: "top",
              }}
            />

            <TouchableOpacity
              onPress={send}
              disabled={sending}
              activeOpacity={0.8}
              style={{ backgroundColor: CYAN, borderRadius: 14, paddingVertical: 15, alignItems: "center" }}
            >
              {sending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Send</Text>
              )}
            </TouchableOpacity>
            {notNow}
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

// A star that pops when it fills; stars fill one after another from the left
function Star({ index, filled, onPress, dark }: { index: number; filled: boolean; onPress: () => void; dark: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (filled) {
      scale.value = withDelay(
        (index - 1) * 60,
        withSequence(withTiming(1.25, { duration: 120 }), withSpring(1, { damping: 8, stiffness: 220 }))
      );
    }
  }, [filled]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPress={onPress} hitSlop={4}>
      <Animated.View style={style}>
        <Svg width={46} height={46} viewBox="0 0 24 24">
          <Path
            d="M12 2.8l2.8 5.7 6.3.9-4.5 4.4 1 6.2L12 17.1 6.4 20l1-6.2L2.9 9.4l6.3-.9z"
            fill={filled ? AMBER : dark ? "#17151C" : "#EFEAF7"}
            stroke={filled ? AMBER : dark ? "#3A3542" : "#D9D2E5"}
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}
