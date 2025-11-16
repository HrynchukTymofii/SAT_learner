import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import Constants from "expo-constants";
import { useAuth, UserType } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { makeRedirectUri } from "expo-auth-session";
import { useSearchParams } from "expo-router/build/hooks";
import Toast from "react-native-toast-message";
import { MotiView, MotiText } from "moti";
import * as SecureStore from "expo-secure-store";

import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { getUserData } from "@/lib/api/user";
import { ArrowLeft, Home } from "lucide-react-native";
import { AppleLoginButton } from "@/components/AppleLoginButton";
import { handleAppleLogin } from "@/hooks/useAppleLogin";
import { useLoadUserInBackground } from "@/lib/user";

GoogleSignin.configure({
  webClientId:
    "329617813146-lmmck18chg6mfgci5i4iddtialht09ij.apps.googleusercontent.com",
  offlineAccess: true,
  forceCodeForRefreshToken: false,
  iosClientId:
    "329617813146-3o5aq7gfvejqoi3mudiar02tl4urhivu.apps.googleusercontent.com",
});

export default function LoginRegisterScreen() {
  const params = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { setToken, setUser } = useAuth();
  const {loadUserInBackground} = useLoadUserInBackground()

  useEffect(() => {
    const requestedTab = params.get("tab");
    if (requestedTab === "register" || requestedTab === "login") {
      setTab(requestedTab);
    }
  }, []);

  const returnUrl = params.get("returnUrl");

  const safeReturnUrl =
    typeof returnUrl === "string" && returnUrl.startsWith("/")
      ? returnUrl
      : "/";

  const { webClientId } = Constants.expoConfig?.extra || {};

  const redirectUri = makeRedirectUri();

  useEffect(() => {
    GoogleSignin.configure({ webClientId });
  }, []);

  useEffect(() => {
    const loadOnboardingData = async () => {
      if (tab === "register") {
        try {
          const stored = await SecureStore.getItemAsync("onboardingAnswers");
          if (stored) {
            const data = JSON.parse(stored);
            if (data.name && data.name.trim().length > 0) {
              setName(data.name.trim());
            } else {
              setName("Student");
            }
          } else {
            setName("Student");
          }
        } catch (err) {
          console.error("Failed to load onboarding data:", err);
          setName("Student");
        }
      }
    };
    loadOnboardingData();
  }, [tab]);

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        if (idToken) {
          const res = await fetch(
            "https://www.satlearner.com/api/auth/google",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_token: idToken }),
            }
          );
          const data = await res.json();
          if (data.token) {
            setToken(data.token);
            const onboarding = await SecureStore.getItemAsync("onboardingCompleted");
            if (onboarding !== "true") {
              await SecureStore.setItemAsync("onboardingCompleted", "true");
            }
            Toast.show({
              type: "success",
              text1: "Login successful",
              text2: "Welcome back!",
              position: "top",
              visibilityTime: 700,
            });
            router.replace(safeReturnUrl as any);
            loadUserInBackground({ token: data.token, setUser, forceSync: true });
          } else {
            Toast.show({
              type: "error",
              text1: "Authentication failed",
              text2: data.error || "Unknown error",
              position: "top",
            });
          }
        }
      }
    } catch (err: any) {
      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.IN_PROGRESS:
            Toast.show({ type: "info", text1: "Google login in progress" });
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Toast.show({
              type: "info",
              text1: "Google Play Services unavailable",
            });
            break;
          default:
            Toast.show({
              type: "error",
              text1: "Google login failed",
              text2: err.message || "Error",
            });
        }
      }
    } finally {
      setGoogleLoading(false)
    }
  };

  const handleEmailAuth = async () => {
    if (loading) return;
    setLoading(true);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^.{4,}$/;

    if (!emailRegex.test(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid email",
        text2: "Please enter a valid email address",
      });
      return;
    }

    if (!passwordRegex.test(password)) {
      Toast.show({
        type: "error",
        text1: "Invalid password",
        text2: "Password must contain at least 4 digits",
      });
      return;
    }

    if (tab === "register" && password !== confirm) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
      });
      return;
    }
    try {
      if (tab === "register") {
        const registerRes = await fetch(
          `https://www.satlearner.com/api/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          }
        );
        if (!registerRes.ok) {
          const errText = await registerRes.text();
          Toast.show({
            type: "error",
            text1: "Registration failed",
            text2: errText,
          });
          return;
        }
      }
      const loginRes = await fetch(
        "https://www.satlearner.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      if (!loginRes.ok) {
        const errData = await loginRes.json().catch(() => ({}));
        const errText = errData.error || "Unknown error";

        if (errText === "User not found") {
          Toast.show({
            type: "error",
            text1: "User not found",
            text2: "Please check your email or register first",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Login failed",
            text2: errText,
          });
        }

        return;
      }

      const data = await loginRes.json();
      if (data.token) {
        await setToken(data.token);

        const onboarding = await SecureStore.getItemAsync("onboardingCompleted");
        if (onboarding !== "true") {
          await SecureStore.setItemAsync("onboardingCompleted", "true");
        }

        router.replace(safeReturnUrl as any);
        loadUserInBackground({ token: data.token, setUser, forceSync: true });
      } else {
        Toast.show({
          type: "error",
          text1: "Authentication error",
          text2: "Please try again",
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Something went wrong",
      });
    } finally{
      setLoading(false)
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      style={{ flex: 1 }}
    >
      {/* Full-screen background gradient */}
      <LinearGradient
        colors={["#1e3a8a", "#3b82f6", "#60a5fa"]}
        start={[0, 0]}
        end={[1, 1]}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="absolute top-12 left-6 z-10 flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => router.push("/")}
              activeOpacity={0.8}
              className="flex-row items-center bg-white/20 px-4 py-2 rounded-full border border-white/30"
            >
              <ArrowLeft size={16} color="white" />
              <Text className="text-white ml-2 font-medium">Back to Home</Text>
            </TouchableOpacity>
          </View>
          {/* Header text */}
          <MotiView
            className="px-6 pt-8 pb-6"
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 700 }}
          >
            <MotiText className="text-white text-4xl font-extrabold text-center mb-2">
              {tab === "login" ? "Welcome Back" : "Create Account"}
            </MotiText>
            <Text className="text-white/80 text-center text-sm">
              {tab === "login"
                ? "Log in to continue your learning"
                : "Sign up to start preparing"}
            </Text>
          </MotiView>
          {/* Form Card (Glass style) */}
          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 600, delay: 300 }}
            className="mx-4 p-6 rounded-3xl bg-[#3b82f6]/80 backdrop-blur-md shadow-lg"
          >
            {/* Toggle */}
            <View className="flex-row bg-white/20 rounded-2xl overflow-hidden mb-5">
              {["login", "register"].map((mode) => {
                const active = tab === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setTab(mode as any)}
                    className="flex-1 py-3 relative items-center justify-center"
                  >
                    {active && (
                      <LinearGradient
                        colors={["#f59e0b", "#fbbf24"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          borderRadius: 16, // rounded-2xl
                        }}
                      />
                    )}
                    <Text
                      className={`font-semibold text-lg ${
                        active ? "text-white" : "text-white/70"
                      }`}
                    >
                      {mode === "login" ? "Login" : "Register"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-white/90 mb-1">Email</Text>
              <TextInput
                className="rounded-2xl px-4 py-3 bg-white/20 text-white"
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.7)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View className="mb-4">
              <Text className="text-white/90 mb-1">Password</Text>
              <TextInput
                className="rounded-2xl px-4 py-3 bg-white/20 text-white"
                placeholder="Enter your password"
                placeholderTextColor="rgba(255,255,255,0.7)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Confirm */}
            {tab === "register" && (
              <View className="mb-6">
                <Text className="text-white/90 mb-1">Confirm Password</Text>
                <TextInput
                  className="rounded-2xl px-4 py-3 bg-white/20 text-white"
                  placeholder="Confirm password"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  secureTextEntry
                  value={confirm}
                  onChangeText={setConfirm}
                />
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleEmailAuth}
              disabled={loading}
              className="rounded-2xl overflow-hidden shadow-lg mt-2"
            >
              <LinearGradient
                colors={["#f59e0b", "#fbbf24"]}
                start={[0, 0]}
                end={[1, 1]}
                style={{ paddingVertical: 12 }}
              >
                <Text className="text-center text-white font-semibold text-base">
                  {tab === "login" ? "Login" : "Register"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <Text className="text-white/70 text-center my-5">or</Text>

            {/* Google */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={googleLoading}
              className="flex-row items-center justify-center rounded-2xl bg-white/15 py-3 border border-white/30"
            >
              <Image
                source={require("@/assets/images/google-logo.webp")}
                style={{ width: 20, height: 20, marginRight: 8 }}
              />
              <Text className="text-white">Continue with Google</Text>
            </TouchableOpacity>

            <AppleLoginButton
              onLogin={() =>
                handleAppleLogin({
                  setToken,
                  setUser,
                  router,
                  safeReturnUrl,
                  loadUserInBackground
                })
              }
            />
          </MotiView>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
