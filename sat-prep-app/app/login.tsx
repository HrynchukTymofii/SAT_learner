import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  Keyboard,
  Image,
} from "react-native";
import Constants from "expo-constants";
import { useAuth, UserType } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { makeRedirectUri } from "expo-auth-session";
import { ArrowLeft } from "lucide-react-native";
import { useSearchParams } from "expo-router/build/hooks";
import Toast from "react-native-toast-message";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { getUserData } from "@/lib/api/user";

GoogleSignin.configure({
  webClientId: "329617813146-lmmck18chg6mfgci5i4iddtialht09ij.apps.googleusercontent.com",
  offlineAccess: true,
  forceCodeForRefreshToken: false,
  iosClientId: "329617813146-3o5aq7gfvejqoi3mudiar02tl4urhivu.apps.googleusercontent.com",
});

export default function LoginRegisterScreen() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const params = useSearchParams();
  const { setToken, setUser } = useAuth();

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

  const loadUserInBackground = (token: string) => {
    getUserData(token)
      .then((res) => {
        if (res.success) {
          const mappedUser: UserType = {
            ...res.user,
            categories: res.user.league,
          };
          setUser(mappedUser);
        }
      })
      .catch((err) => console.error("Error loading user:", err));
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        if (idToken) {
          const res = await fetch(
            "https://sat-ecosystem.vercel.app/api/auth/google",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id_token: idToken }),
            }
          );
          const data = await res.json();
          if (data.token) {
            setToken(data.token);
            Toast.show({
              type: "success",
              text1: "Login successful",
              text2: "Welcome back!",
              position: "top",
              visibilityTime: 700,
            });
            router.replace(safeReturnUrl as any);
            loadUserInBackground(data.token);
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
            Toast.show({ type: "info", text1: "Google Play Services unavailable" });
            break;
          default:
            Toast.show({
              type: "error",
              text1: "Google login failed",
              text2: err.message || "Error",
            });
        }
      }
    }
  };

  const handleEmailAuth = async () => {
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
          `https://sat-ecosystem.vercel.app/api/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          }
        );
        if (!registerRes.ok) {
          const errText = await registerRes.text();
          Toast.show({ type: "error", text1: "Registration failed", text2: errText });
          return;
        }
      }
      const loginRes = await fetch(
        "https://sat-ecosystem.vercel.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );
      if (!loginRes.ok) {
        const errText = await loginRes.text();
        Toast.show({ type: "error", text1: "Login failed", text2: errText });
        return;
      }
      const data = await loginRes.json();
      if (data.token) {
        await setToken(data.token);
        router.replace(safeReturnUrl as any);
        loadUserInBackground(data.token);
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
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 0}
      >
        <ScrollView
          className="flex-1 bg-slate-50 dark:bg-stone-900"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <LinearGradient
            colors={["#8b5cf6", "#f97316"]} // violet to orange
            start={[0, 0]}
            end={[1, 0]}
            style={{
              borderRadius: 12,
              marginBottom: 16,
              paddingHorizontal: 24,
              paddingVertical: 32,
              paddingTop: 56,
            }}
          >
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.push("/")}
              className="flex flex-row items-center gap-x-3 bg-white/10 border border-white/30 rounded-full px-4 py-2 mb-6"
              activeOpacity={0.8}
            >
              <ArrowLeft size={16} color="white" />
              <Text className="text-white font-medium text-base">Back to Home</Text>
            </TouchableOpacity>

            {/* Title */}
            {tab === "login" ? (
              <>
                <Text className="text-white text-3xl font-extrabold text-center mb-2">
                  Welcome Back
                </Text>
                <Text className="text-white/80 text-center text-sm">
                  Log in to continue your learning
                </Text>
              </>
            ) : (
              <>
                <Text className="text-white text-3xl font-extrabold text-center mb-2">
                  Create Account
                </Text>
                <Text className="text-white/80 text-center text-sm">
                  Sign up to start preparing
                </Text>
              </>
            )}
          </LinearGradient>

          {/* Form */}
          <View className="bg-white dark:bg-stone-800 p-5 rounded-xl shadow-md m-2">
            {/* Toggle */}
            <View className="flex-row bg-gray-200 dark:bg-stone-700 rounded-xl overflow-hidden mb-4">
              {["login", "register"].map((mode, index) => {
                const active = tab === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setTab(mode as any)}
                    activeOpacity={0.8}
                    className="flex-1 py-3 relative"
                    style={{
                      borderTopLeftRadius: index === 0 ? 16 : 0,
                      borderBottomLeftRadius: index === 0 ? 16 : 0,
                      borderTopRightRadius: index === 1 ? 16 : 0,
                      borderBottomRightRadius: index === 1 ? 16 : 0,
                    }}
                  >
                    {active && (
                      <LinearGradient
                        colors={["#8b5cf6", "#f97316"]}
                        start={[0, 0]}
                        end={[1, 0]}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          borderRadius: 12,
                        }}
                      />
                    )}
                    <Text
                      className={`text-center text-lg font-semibold z-10 ${
                        active ? "text-white" : "text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {mode === "login" ? "Login" : "Register"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Name */}
            {tab === "register" && (
              <View className="mb-4">
                <Text className="text-slate-700 dark:text-gray-200 mb-1">Name</Text>
                <TextInput
                  className="border border-gray-300 dark:border-stone-600 rounded px-4 py-2 bg-white dark:bg-stone-900 text-black dark:text-white"
                  placeholder="Your name"
                  placeholderTextColor="#a3a3a3"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            {/* Email */}
            <View className="mb-4">
              <Text className="text-slate-700 dark:text-gray-200 mb-1">Email</Text>
              <TextInput
                className="border border-gray-300 dark:border-stone-600 rounded px-4 py-2 bg-white dark:bg-stone-900 text-black dark:text-white"
                placeholder="Enter your email"
                placeholderTextColor="#a3a3a3"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View className="mb-4">
              <Text className="text-slate-700 dark:text-gray-200 mb-1">Password</Text>
              <TextInput
                className="border border-gray-300 dark:border-stone-600 rounded px-4 py-2 bg-white dark:bg-stone-900 text-black dark:text-white"
                placeholder="Enter your password"
                placeholderTextColor="#a3a3a3"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Confirm */}
            {tab === "register" && (
              <View className="mb-6">
                <Text className="text-slate-700 dark:text-gray-200 mb-1">
                  Confirm Password
                </Text>
                <TextInput
                  className="border border-gray-300 dark:border-stone-600 rounded px-4 py-2 bg-white dark:bg-stone-900 text-black dark:text-white"
                  placeholder="Confirm your password"
                  placeholderTextColor="#a3a3a3"
                  secureTextEntry
                  value={confirm}
                  onChangeText={setConfirm}
                />
              </View>
            )}

            {/* Button */}
            <TouchableOpacity onPress={handleEmailAuth} className="rounded-lg overflow-hidden">
              <LinearGradient
                colors={["#8b5cf6", "#f97316"]}
                start={[0, 0]}
                end={[1, 0]}
                style={{ paddingVertical: 12 }}
              >
                <Text className="text-white font-bold text-center text-lg">
                  {tab === "login" ? "Login" : "Register"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View className="my-6 flex items-center justify-center">
              <Text className="text-slate-500 dark:text-gray-400 text-xs">or</Text>
            </View>

            {/* Google */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              className="w-full py-3 rounded-lg flex-row items-center justify-center border border-gray-300 dark:border-stone-600 bg-white dark:bg-stone-900"
              activeOpacity={0.9}
            >
              <Image
                source={require("@/assets/images/google-logo.webp")}
                style={{ width: 20, height: 20, marginRight: 8 }}
                resizeMode="contain"
              />
              <Text className="text-gray-700 dark:text-gray-200 font-medium text-base">
                Continue with Google
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
