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
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { AppleLoginButton } from "@/components/AppleLoginButton";
import { handleAppleLogin } from "@/hooks/useAppleLogin";
import { useLoadUserInBackground } from "@/lib/user";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    "329617813146-lmmck18chg6mfgci5i4iddtialht09ij.apps.googleusercontent.com",
  offlineAccess: true,
  forceCodeForRefreshToken: false,
  iosClientId:
    "329617813146-3o5aq7gfvejqoi3mudiar02tl4urhivu.apps.googleusercontent.com",
});

export default function AuthScreen() {
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { setToken, setUser } = useAuth();
  const { loadUserInBackground } = useLoadUserInBackground();

  const returnUrl = params.get("returnUrl");
  const safeReturnUrl =
    typeof returnUrl === "string" && returnUrl.startsWith("/")
      ? returnUrl
      : "/";

  // Check if initial mode is set via params
  useEffect(() => {
    const tab = params.get("tab");
    if (tab === "register" || tab === "login") {
      setMode(tab);
    }
  }, []);

  // Load name from onboarding data for register mode
  useEffect(() => {
    const loadOnboardingData = async () => {
      if (mode === "register") {
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
  }, [mode]);

  const handleGoogleAuth = async () => {
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
            const onboarding = await SecureStore.getItemAsync(
              "onboardingCompleted"
            );
            if (onboarding !== "true") {
              await SecureStore.setItemAsync("onboardingCompleted", "true");
            }

            // Check if this is first login and user should see selling onboarding
            const sellingOnboardingCompleted = await SecureStore.getItemAsync(
              "sellingOnboardingCompleted"
            );
            const isFirstLogin = mode === "register" || sellingOnboardingCompleted !== "true";

            Toast.show({
              type: "success",
              text1: mode === "login" ? "Login successful" : "Sign up successful",
              text2: mode === "login" ? "Welcome back!" : "Welcome to SAT Math Learner!",
              position: "top",
              visibilityTime: 700,
            });

            // Load user data in background
            loadUserInBackground({
              token: data.token,
              setUser,
              forceSync: true,
            });

            // Navigate to selling onboarding if first time, else go to safe return URL
            if (isFirstLogin) {
              router.replace("/selling-onboarding" as any);
            } else {
              router.replace(safeReturnUrl as any);
            }
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
            Toast.show({ type: "info", text1: "Google authentication in progress" });
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
              text1: "Google authentication failed",
              text2: err.message || "Error",
            });
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    if (loading) return;

    // Validation for register mode
    if (mode === "register" && !agreeToTerms) {
      Toast.show({
        type: "error",
        text1: "Terms & Conditions",
        text2: "Please agree to the Terms & Conditions",
      });
      return;
    }

    setLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Toast.show({
        type: "error",
        text1: "Invalid email",
        text2: "Please enter a valid email address",
      });
      setLoading(false);
      return;
    }

    if (password.length < 4) {
      Toast.show({
        type: "error",
        text1: "Invalid password",
        text2: "Password must be at least 4 characters",
      });
      setLoading(false);
      return;
    }

    try {
      // Register first if in register mode
      if (mode === "register") {
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
          setLoading(false);
          return;
        }
      }

      // Login
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
            text1: mode === "login" ? "Login failed" : "Authentication failed",
            text2: errText,
          });
        }
        setLoading(false);
        return;
      }

      const data = await loginRes.json();
      if (data.token) {
        await setToken(data.token);

        const onboarding = await SecureStore.getItemAsync(
          "onboardingCompleted"
        );
        if (onboarding !== "true") {
          await SecureStore.setItemAsync("onboardingCompleted", "true");
        }

        // Check if this is first login and user should see selling onboarding
        const sellingOnboardingCompleted = await SecureStore.getItemAsync(
          "sellingOnboardingCompleted"
        );
        const isFirstLogin = mode === "register" || sellingOnboardingCompleted !== "true";

        Toast.show({
          type: "success",
          text1: mode === "login" ? "Login successful" : "Registration successful",
          text2: mode === "login" ? "Welcome back!" : "Welcome to SAT Math Learner!",
          position: "top",
          visibilityTime: 700,
        });

        // Load user data in background
        loadUserInBackground({ token: data.token, setUser, forceSync: true });

        // Navigate to selling onboarding if first time, else go to safe return URL
        if (isFirstLogin) {
          router.replace("/selling-onboarding" as any);
        } else {
          router.replace(safeReturnUrl as any);
        }
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white dark:bg-gray-900"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header with Back Button */}
        <View className="pt-12 pl-6 pb-6">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="mb-6"
          >
            <ArrowLeft size={24} color="#06B6D4" />
          </TouchableOpacity>

          <Text className="text-4xl font-bold text-gray-900 dark:text-white">
            {mode === "login" ? "Welcome Back! 👋" : "Start Your Journey ✨"}
          </Text>
          <Text className="text-gray-600 dark:text-gray-300 mt-3 pr-6 leading-6">
            {mode === "login"
              ? "Continue your SAT Math preparation and ace your exam"
              : "Join thousands of students mastering SAT Math. Sign up to get started"}
          </Text>
        </View>

        {/* Form Container */}
        <View className="px-6 flex-1">
          {/* Email Input */}
          <View className="mb-4">
            <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">Email</Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2">
              <Mail size={20} color="#06B6D4" />
              <TextInput
                className="flex-1 ml-3 text-gray-900 dark:text-white"
                placeholder="Your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-gray-700 dark:text-gray-300 mb-2 font-medium">Password</Text>
            <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2">
              <Lock size={20} color="#06B6D4" />
              <TextInput
                className="flex-1 ml-3 text-gray-900 dark:text-white"
                placeholder="Your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#06B6D4" />
                ) : (
                  <Eye size={20} color="#06B6D4" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me & Forgot Password (Login Mode) */}
          {/* {mode === "login" && (
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity
                onPress={() => {
                }}
                activeOpacity={0.7}
              >
                <Text className="text-cyan-500 font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
          )} */}

          {/* Terms & Conditions (Register Mode) */}
          {mode === "register" && (
            <View className="flex-row items-start mb-6">
              <TouchableOpacity
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.7}
                className="mr-3 mt-0.5"
              >
                <View
                  className={`w-5 h-5 rounded border-2 items-center justify-center ${
                    agreeToTerms
                      ? "bg-cyan-500 border-cyan-500"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  }`}
                >
                  {agreeToTerms && <Text className="text-white text-xs">✓</Text>}
                </View>
              </TouchableOpacity>
              <Text className="flex-1 text-gray-700 dark:text-gray-300 text-sm">
                I agree to SAT Math Learner{" "}
                <Text className="text-cyan-500 dark:text-cyan-400 font-medium">
                  Terms & Conditions
                </Text>
                .
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleEmailAuth}
            disabled={loading}
            activeOpacity={0.8}
            className="bg-cyan-500 rounded-full py-4 items-center justify-center mb-6"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                {mode === "login" ? "Sign in" : "Sign up"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <Text className="mx-4 text-gray-500 dark:text-gray-400">or continue with</Text>
            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </View>

          {/* Social Login Buttons */}
          <View className="flex-row justify-center items-center gap-x-8 mb-6">
            <TouchableOpacity
              onPress={handleGoogleAuth}
              disabled={googleLoading}
              activeOpacity={0.7}
              className="w-28 h-16 rounded-full border border-gray-200 dark:border-gray-700 items-center justify-center bg-white dark:bg-gray-800"
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#06B6D4" />
              ) : (
                <Image
                  source={require("@/assets/images/google-logo.webp")}
                  style={{ width: 24, height: 24 }}
                />
              )}
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <TouchableOpacity
                onPress={() =>
                  handleAppleLogin({
                    setToken,
                    setUser,
                    router,
                    safeReturnUrl,
                    loadUserInBackground,
                  })
                }
                activeOpacity={0.7}
                className="w-28 h-16 rounded-full border border-gray-200 dark:border-gray-700 items-center justify-center bg-white dark:bg-gray-800"
              >
                <Image
                  source={require("@/assets/images/apple-logo.png")}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableOpacity>
            )}
          </View>
          {/* Toggle to other mode */}
          <View className="flex-row justify-center items-center mt-auto mb-24">
            <Text className="text-gray-600 dark:text-gray-400">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <TouchableOpacity
              onPress={() => setMode(mode === "login" ? "register" : "login")}
              activeOpacity={0.7}
            >
              <Text className="text-cyan-500 dark:text-cyan-400 font-medium">
                {mode === "login" ? "Sign up" : "Sign in"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}