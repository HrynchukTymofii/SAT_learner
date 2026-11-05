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
import { Fonts, usePalette } from "@/constants/palette";
import { LinkButton, PastelCard, PillButton, Screen, T, Tap } from "@/components/ds";
import { SlopeArt } from "@/components/art";
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
    <Screen contentStyle={{ flexGrow: 1 }}>
      <PastelCard tone="lav" radius={34} style={{ minHeight: 300, padding: 22, justifyContent: "flex-end", marginTop: 8 }}>
        <View style={{ position: "absolute", right: 0, left: 0, top: 18, alignItems: "center" }} pointerEvents="none">
          <SlopeArt width={190} height={178} />
        </View>
        <T variant="smallStrong" onPastel style={{ marginBottom: 6 }}>
          SAT Math Learner
        </T>
        <T style={{ fontFamily: Fonts.display, fontSize: 34, lineHeight: 36, letterSpacing: -0.8 }} onPastel>
          Let's get you started
        </T>
      </PastelCard>

      <T variant="small" style={{ fontSize: 14.5, lineHeight: 21 }}>
        Make a free account to save your answers, scores and points, and keep them on any phone.
      </T>

      <View style={{ gap: 10 }}>
        <AuthButton title="Continue with Google" loading={googleLoading} onPress={handleGoogleAuth} image={require("@/assets/images/google-logo.webp")} />
        {Platform.OS === "ios" && (
          <AuthButton title="Continue with Apple" loading={appleLoading} onPress={handleAppleAuth} image={require("@/assets/images/apple-logo.png")} tintDark />
        )}
        <PillButton title="Sign up with email" icon={Mail} onPress={handleEmailAuth} />
      </View>

      <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
        <T variant="small">Already have an account?</T>
        <LinkButton title="Log in" onPress={() => router.push({ pathname: "/login", params: { tab: "login" } } as any)} />
      </View>

      <View style={{ flex: 1 }} />
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 18 }}>
        <LinkButton title="Privacy Policy" onPress={() => Linking.openURL("https://www.satlearner.com/privacy-policy")} />
        <LinkButton title="Terms of Service" onPress={() => Linking.openURL("https://www.satlearner.com/terms-of-service")} />
      </View>
    </Screen>
  );
}

function AuthButton({ title, onPress, loading, image, tintDark }: { title: string; onPress: () => void; loading?: boolean; image: any; tintDark?: boolean }) {
  const c = usePalette();
  return (
    <Tap
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        minHeight: 56,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: c.line,
        backgroundColor: c.surface,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator color={c.ink} />
      ) : (
        <>
          <Image source={image} style={{ width: 20, height: 20, tintColor: tintDark && c.isDark ? "#fff" : undefined }} />
          <T variant="bodyStrong">{title}</T>
        </>
      )}
    </Tap>
  );
}
