import React, { useState, useEffect } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts, usePalette } from "@/constants/palette";
import { Checkbox, Field, GUTTER, PastelCard, PillButton, T, TopBar, Tap } from "@/components/ds";
import { SlopeArt } from "@/components/art";
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
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react-native";
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
  const c = usePalette();
  const insets = useSafeAreaInsets();

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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: GUTTER, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <TopBar onBack={handleBack} />

        {/* Hero card */}
        <PastelCard tone={mode === "login" ? "lav" : "butter"} radius={30} style={{ marginTop: 16, padding: 22, minHeight: 170, justifyContent: "flex-end" }}>
          <View style={{ position: "absolute", right: 6, top: 6 }} pointerEvents="none">
            <SlopeArt width={120} height={112} />
          </View>
          <T variant="smallStrong" onPastel style={{ marginBottom: 6 }}>
            {mode === "login" ? "Welcome back" : "New here?"}
          </T>
          <T style={{ fontFamily: Fonts.display, fontSize: 32, lineHeight: 34, letterSpacing: -0.7, maxWidth: "75%" }} onPastel>
            {mode === "login" ? "Log in to keep going" : "Create your account"}
          </T>
        </PastelCard>

        {/* Login / Sign up switch */}
        <View style={{ flexDirection: "row", backgroundColor: c.surface2, borderRadius: 999, padding: 4, marginTop: 20 }}>
          {(["login", "register"] as const).map((m) => (
            <Tap
              key={m}
              onPress={() => setMode(m)}
              style={{ flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 999, backgroundColor: mode === m ? c.inkButton : "transparent" }}
            >
              <T variant="smallStrong" color={mode === m ? c.inkButtonText : c.muted} style={{ fontSize: 14 }}>
                {m === "login" ? "Log in" : "Sign up"}
              </T>
            </Tap>
          ))}
        </View>

        <View style={{ gap: 14, marginTop: 20 }}>
          <Field
            label="Email"
            icon={Mail}
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
          />
          <Field
            label="Password"
            icon={Lock}
            placeholder={mode === "login" ? "Your password" : "At least 4 characters"}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoComplete={mode === "login" ? "password" : "new-password"}
            returnKeyType="go"
            onSubmitEditing={handleEmailAuth}
            right={
              <Tap hitSlop={10} onPress={() => setShowPassword(!showPassword)} accessibilityLabel={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={19} color={c.muted} /> : <Eye size={19} color={c.muted} />}
              </Tap>
            }
          />

          {mode === "register" && (
            <Tap onPress={() => setAgreeToTerms(!agreeToTerms)} style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 2 }}>
              <Checkbox checked={agreeToTerms} onPress={() => setAgreeToTerms(!agreeToTerms)} />
              <T variant="small" style={{ flex: 1 }}>
                I agree to the{" "}
                <T variant="smallStrong" color={c.brand} onPress={() => Linking.openURL("https://www.satlearner.com/terms-of-service")}>
                  Terms & Conditions
                </T>
              </T>
            </Tap>
          )}

          <PillButton
            title={mode === "login" ? "Log in" : "Create account"}
            icon={ArrowRight}
            loading={loading}
            onPress={handleEmailAuth}
            style={{ marginTop: 6 }}
          />
        </View>

        {/* Divider */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 22 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
          <T variant="caption">or</T>
          <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
        </View>

        <View style={{ gap: 10 }}>
          <SocialButton
            title="Continue with Google"
            loading={googleLoading}
            onPress={handleGoogleAuth}
            image={require("@/assets/images/google-logo.webp")}
          />
          {Platform.OS === "ios" && (
            <SocialButton
              title="Continue with Apple"
              onPress={() => handleAppleLogin({ setToken, setUser, router, safeReturnUrl, loadUserInBackground })}
              image={require("@/assets/images/apple-logo.png")}
              tintDark
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SocialButton({ title, onPress, loading, image, tintDark }: { title: string; onPress: () => void; loading?: boolean; image: any; tintDark?: boolean }) {
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
        minHeight: 54,
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
