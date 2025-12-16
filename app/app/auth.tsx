import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "expo-router/build/hooks";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Mail } from "lucide-react-native";
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

export default function AuthLandingScreen() {
  const params = useSearchParams();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const { setToken, setUser } = useAuth();
  const { loadUserInBackground } = useLoadUserInBackground();

  const returnUrl = params.get("returnUrl");
  const safeReturnUrl =
    typeof returnUrl === "string" && returnUrl.startsWith("/")
      ? returnUrl
      : "/";

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
            Toast.show({
              type: "success",
              text1: "Welcome!",
              text2: "Authentication successful",
              position: "top",
              visibilityTime: 700,
            });
            router.replace(safeReturnUrl as any);
            loadUserInBackground({
              token: data.token,
              setUser,
              forceSync: true,
            });
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
            Toast.show({ type: "info", text1: "Google sign in in progress" });
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
              text1: "Google sign in failed",
              text2: err.message || "Error",
            });
        }
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    if (appleLoading) return;
    setAppleLoading(true);
    try {
      await handleAppleLogin({
        setToken,
        setUser,
        router,
        safeReturnUrl,
        loadUserInBackground,
      });
    } catch (err) {
      console.error("Apple login error:", err);
    } finally {
      setAppleLoading(false);
    }
  };

  const handleEmailAuth = () => {
    router.push({ pathname: "/login", params: { tab: "register" } } as any);
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
        bounces={false}
      >
        {/* Logo */}
        <View className="items-center mb-12">
          <View className="w-24 h-24 bg-cyan-500 rounded-3xl items-center justify-center mb-8">
            {/* Replace with your actual logo */}
            <Image
              source={require("@/assets/images/splash-icon-light.png")}
              style={{ width: 90, height: 90 }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Let's Get Started!
          </Text>
          <Text className="text-gray-600 dark:text-gray-300 text-center">
            Let's dive in into your account
          </Text>
        </View>

        {/* Auth Options */}
        <View className="mb-8">
          {/* Google */}
          <TouchableOpacity
            onPress={handleGoogleAuth}
            disabled={googleLoading}
            activeOpacity={0.7}
            className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 mb-4 shadow-sm"
          >
            {googleLoading ? (
              <ActivityIndicator
                size="small"
                color="#06B6D4"
                className="mr-4"
              />
            ) : (
              <Image
                source={require("@/assets/images/google-logo.webp")}
                style={{ width: 24, height: 24, marginRight: 16 }}
              />
            )}
            <Text className="text-gray-900 dark:text-white font-medium text-base flex-1">
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Apple - iOS only */}
          {Platform.OS === "ios" && (
            <TouchableOpacity
              onPress={handleAppleAuth}
              disabled={appleLoading}
              activeOpacity={0.7}
              className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 mb-4 shadow-sm"
            >
              {appleLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#06B6D4"
                  className="mr-4"
                />
              ) : (
                <Image
                  source={require("@/assets/images/apple-logo.png")}
                  style={{ width: 24, height: 24, marginRight: 16 }}
                />
              )}
              <Text className="text-gray-900 dark:text-white font-medium text-base flex-1">
                Continue with Apple
              </Text>
            </TouchableOpacity>
          )}

          {/* Email */}
          <TouchableOpacity
            onPress={handleEmailAuth}
            activeOpacity={0.7}
            className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-6 py-4 shadow-sm"
          >
            <Mail size={24} color="#06B6D4" style={{ marginRight: 16 }} />
            <Text className="text-gray-900 dark:text-white font-medium text-base flex-1">
              Continue with Email
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/login",
              params: { tab: "register" },
            } as any)
          }
          activeOpacity={0.8}
          className="bg-cyan-500 rounded-full py-4 items-center justify-center mb-4"
        >
          <Text className="text-white font-semibold text-base">Sign up</Text>
        </TouchableOpacity>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/login", params: { tab: "login" } } as any)
          }
          activeOpacity={0.8}
          className="bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full py-4 items-center justify-center mb-8"
        >
          <Text className="text-cyan-500 dark:text-cyan-400 font-semibold text-base">
            Sign in
          </Text>
        </TouchableOpacity>

        {/* Footer Links */}
        <View className="flex-row justify-center items-center">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Linking.openURL("https://www.satlearner.com/privacy-policy")
            }
          >
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Privacy Policy
            </Text>
          </TouchableOpacity>

          <Text className="text-gray-400 dark:text-gray-500 mx-2">·</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Linking.openURL("https://www.satlearner.com/terms-of-service")
            }
          >
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Terms of Service
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
