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
  Linking,
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
import { useColorScheme } from "@/hooks/useColorScheme";

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
            // if (isFirstLogin) {
            //   router.replace("/selling-onboarding" as any);
            // } else {
              router.replace(safeReturnUrl as any);
            // }
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

        if (loginRes.status === 401) {
          Toast.show({
            type: "error",
            text1: "Invalid email or password",
            text2: "Check your details or register first",
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
        // if (isFirstLogin) {
        //   router.replace("/selling-onboarding" as any);
        // } else {
          router.replace(safeReturnUrl as any);
        // }
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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: isDark ? "#0B0A0F" : "#ffffff" }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header with Back Button */}
        <View style={{ paddingTop: 48, paddingLeft: 24, paddingBottom: 24 }}>
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            style={{ marginBottom: 24 }}
          >
            <ArrowLeft size={24} color="#8A5CE6" />
          </TouchableOpacity>

          <Text style={{
            fontSize: 36,
            fontWeight: "bold",
            color: isDark ? "#F4F1F8" : "#0B0A0F"
          }}>
            {mode === "login" ? "Welcome Back! 👋" : "Start Your Journey ✨"}
          </Text>
          <Text style={{
            color: isDark ? "#CFC9DA" : "#4F4A5A",
            marginTop: 12,
            paddingRight: 24,
            lineHeight: 24
          }}>
            {mode === "login"
              ? "Continue your SAT Math preparation and ace your exam"
              : "Join thousands of students mastering SAT Math. Sign up to get started"}
          </Text>
        </View>

        {/* Form Container */}
        <View style={{ paddingHorizontal: 24, flex: 1 }}>
          {/* Email Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              color: isDark ? "#CFC9DA" : "#2E2A35",
              marginBottom: 8,
              fontWeight: "500"
            }}>Email</Text>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#17151C" : "#F4F1F9",
              borderWidth: 1,
              borderColor: isDark ? "#2B2733" : "#E5DFEE",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: Platform.OS === 'ios' ? 16 : 8
            }}>
              <Mail size={20} color="#8A5CE6" />
              <TextInput
                style={{ flex: 1, marginLeft: 12, color: isDark ? "#F4F1F8" : "#0B0A0F" }}
                placeholder="Your email"
                placeholderTextColor="#9C95A8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              color: isDark ? "#CFC9DA" : "#2E2A35",
              marginBottom: 8,
              fontWeight: "500"
            }}>Password</Text>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isDark ? "#17151C" : "#F4F1F9",
              borderWidth: 1,
              borderColor: isDark ? "#2B2733" : "#E5DFEE",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: Platform.OS === 'ios' ? 16 : 8
            }}>
              <Lock size={20} color="#8A5CE6" />
              <TextInput
                style={{ flex: 1, marginLeft: 12, color: isDark ? "#F4F1F8" : "#0B0A0F" }}
                placeholder="Your password"
                placeholderTextColor="#9C95A8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#8A5CE6" />
                ) : (
                  <Eye size={20} color="#8A5CE6" />
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
            <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 24 }}>
              <TouchableOpacity
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.7}
                style={{ marginRight: 12, marginTop: 2 }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: agreeToTerms ? "#8A5CE6" : (isDark ? "#3A3542" : "#D9D2E5"),
                    backgroundColor: agreeToTerms ? "#8A5CE6" : (isDark ? "#17151C" : "#ffffff"),
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {agreeToTerms && <Text style={{ color: "#ffffff", fontSize: 12 }}>✓</Text>}
                </View>
              </TouchableOpacity>
              <Text style={{ flex: 1, color: isDark ? "#CFC9DA" : "#2E2A35", fontSize: 14 }}>
                I agree to SAT Math Learner{" "}
                <Text
                  style={{ color: isDark ? "#C9AAFB" : "#7A4BDB", fontWeight: "500" }}
                  onPress={() => Linking.openURL("https://www.satlearner.com/terms-of-service")}
                >
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
            style={{
              backgroundColor: "#8A5CE6",
              borderRadius: 24,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24
            }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
                {mode === "login" ? "Sign in" : "Sign up"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: isDark ? "#2B2733" : "#E5DFEE" }} />
            <Text style={{ marginHorizontal: 16, color: isDark ? "#9C95A8" : "#6B6577" }}>or continue with</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: isDark ? "#2B2733" : "#E5DFEE" }} />
          </View>

          {/* Social Login Buttons */}
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 32, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={handleGoogleAuth}
              disabled={googleLoading}
              activeOpacity={0.7}
              style={{
                width: 112,
                height: 64,
                borderRadius: 48,
                borderWidth: 1,
                borderColor: isDark ? "#2B2733" : "#E5DFEE",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDark ? "#17151C" : "#ffffff"
              }}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#8A5CE6" />
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
                style={{
                  width: 112,
                  height: 64,
                  borderRadius: 48,
                  borderWidth: 1,
                  borderColor: isDark ? "#2B2733" : "#E5DFEE",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isDark ? "#17151C" : "#ffffff"
                }}
              >
                <Image
                  source={require("@/assets/images/apple-logo.png")}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableOpacity>
            )}
          </View>
          {/* Toggle to other mode */}
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: "auto", marginBottom: 96 }}>
            <Text style={{ color: isDark ? "#9C95A8" : "#4F4A5A" }}>
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <TouchableOpacity
              onPress={() => setMode(mode === "login" ? "register" : "login")}
              activeOpacity={0.7}
            >
              <Text style={{ color: isDark ? "#C9AAFB" : "#7A4BDB", fontWeight: "500" }}>
                {mode === "login" ? "Sign up" : "Sign in"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}