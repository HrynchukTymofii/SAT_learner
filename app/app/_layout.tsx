import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "expo-router/react-navigation";
import { useFonts } from "expo-font";
import { Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from "@expo-google-fonts/outfit";
import {
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { usePalette } from "@/constants/palette";
import { Redirect, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ds/overlays";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TourProvider } from "@/context/TourContext";
import RatePromptSheet from "@/components/modals/RatePromptSheet";
import { ThemeProvider as CustomThemeProvider } from "@/context/ThemeContext";
import { Suspense, useEffect, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { SQLiteProvider } from "expo-sqlite";
import CustomPreloadScreen from "@/components/ui/CustomPreloadScreen";
import * as Network from "expo-network";

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { AppState, Platform, useColorScheme } from "react-native";
import { useLoadUserInBackground } from "@/lib/user";
import { getUserSession } from "@/lib/session";
import { upgradeToPro, removePro } from "@/lib/api/user";
import { scheduleDailyStudyReminder, isDailyReminderTurnedOff, requestNotificationPermissions } from "@/lib/notifications";
import { registerPushToken } from "@/lib/inbox";
import * as Notifications from "expo-notifications";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

function AppSyncWrapper({ children }: { children: React.ReactNode }) {
  const { token, setToken, user, setUser } = useAuth();
  const [isOffline, setIsOffline] = useState(false);
  const { loadUserInBackground } = useLoadUserInBackground();

  // The AppState listener keeps the syncIfOnline from the render it was created in,
  // so read the latest user through a ref instead of the closure
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Configure RevenueCat before the first sync touches it (effects run in order)
  useEffect(() => {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.WARN);

    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: "appl_plYVBUscFYEJQnxkmHBsnMRhbIa" });
    } else if (Platform.OS === "android") {
      Purchases.configure({ apiKey: "goog_RDVEiwhMsfMcTDNFxFdGkPiMLes" });
    }
  }, []);

  const syncIfOnline = async () => {
    if (!token) return;
    const startedSession = getUserSession();

    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        setIsOffline(true);
        return;
      }

      setIsOffline(false);
      const { tokenValid, user: freshUser } = await loadUserInBackground({ token, setUser, setToken });
      if (!tokenValid) return;

      // Prefer the user just loaded from the server; fall back to the latest local one
      const currentUser = freshUser ?? userRef.current;

      if (currentUser) {
        try {
          // Logged out meanwhile: don't bring the old user back with setUser
          const loggedOut = () => startedSession !== getUserSession();

          // If RevenueCat login failed we'd be looking at the anonymous user
          // (no entitlements) and would wrongly remove PRO
          if (await Purchases.isAnonymous()) return;

          // Get fresh info from RevenueCat, not the cached one
          await Purchases.invalidateCustomerInfoCache();
          const customerInfo = await Purchases.getCustomerInfo();

          // RevenueCat decides what is active (handles expiry, renewals, trials, grace periods, refunds)
          const active = customerInfo.entitlements.active;

          let plan: string | null = null;
          if (active["PRO Yearly"]) {
            plan = "PRO Yearly";
          } else if (active["PRO Monthly"]) {
            plan = "PRO Monthly";
          }

          // Now sync with backend and local state
          if (plan) {
            // User should have PRO based on RevenueCat
            if (!currentUser.isPro) {
              const res = await upgradeToPro(token, plan);

              if (res.success && !loggedOut()) {
                setUser({ ...currentUser, isPro: true });
              } else {
                console.warn("❌ Failed to sync PRO status:", res.error);
              }
            }
          } else {
            // User should NOT have PRO
            if (currentUser.isPro && !loggedOut()) {
              setUser({ ...currentUser, isPro: false });
              await removePro(token);
            }
          }
        } catch (err) {
          console.warn("Failed to sync PRO status", err);
        }
      }
    } catch (err) {
      console.error("Background sync failed:", err);
    }
  };

  // 1️⃣ Fire-and-forget sync on app start
  useEffect(() => {
    syncIfOnline();
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        syncIfOnline();
      }
    });

    return () => subscription.remove();
  }, [token]);

  // Daily study reminder (once per launch) and push registration (again whenever the account changes).
  // One effect so the permission prompt is asked once, before the push token is requested.
  const reminderSetUp = useRef(false);
  useEffect(() => {
    // Local and push notifications only exist on iOS/Android
    if (Platform.OS === "web") return;
    (async () => {
      try {
        if (!reminderSetUp.current) {
          reminderSetUp.current = true;
          // Turned off in Settings: leave it off, but still ask so pushes can arrive
          if (await isDailyReminderTurnedOff()) await requestNotificationPermissions();
          else await scheduleDailyStudyReminder();
        }
      } catch (error) {
        console.error("Failed to schedule daily reminder:", error);
      }
      await registerPushToken(token ?? null);
    })();
  }, [token]);

  // Tapping a push from the inbox opens its link (or the inbox)
  const router = useRouter();
  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { type?: string; url?: string | null } | undefined;
      if (data?.type !== "inbox") return;
      router.push((data.url && data.url.startsWith("/") ? data.url : "/notifications") as any);
    });
    return () => sub.remove();
  }, [router]);

  return <>{children}</>;
}


// Screens sit on the app background, so there is no white flash between pushes
function ThemedStack({ children }: { children: React.ReactNode }) {
  const c = usePalette();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
      {children}
    </Stack>
  );
}

// Follows the theme chosen in Settings, not just the phone's setting
function ThemedStatusBar() {
  const c = usePalette();
  return <StatusBar style={c.isDark ? "light" : "dark"} />;
}

export default function RootLayout() {
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const [onboardingDone, setOnboardingDone] = useState<boolean>(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      const done = await SecureStore.getItemAsync("onboardingCompleted");
      setOnboardingDone(!!done);
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (onboardingDone === false) {
      router.replace("/onboarding");
    }
  }, [onboardingDone]);

  // Wait until we know the onboarding status + fonts loaded
  if (!loaded) return <CustomPreloadScreen />;

  // Otherwise show the normal app
  return (
    
      <AuthProvider>
       
          <Suspense fallback={<CustomPreloadScreen />}>
            <SQLiteProvider
              databaseName="satprep.db"
              assetSource={{
                assetId: require("@/assets/databases/satprep.db"),
              }}
              useSuspense
            >
              <AppSyncWrapper>
                 <TourProvider>
                <CustomThemeProvider>
                  <ThemedStack>
                    {/* Main tabs */}
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                    {/* Auth screens */}
                    <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                    <Stack.Screen name="login" options={{ headerShown: false }} />
                    <Stack.Screen name="register" options={{ headerShown: false }} />
                    <Stack.Screen name="auth" options={{ headerShown: false }} />
                    <Stack.Screen
                      name="selling-onboarding"
                      options={{ headerShown: false }}
                    />

                    {/* Profile & Settings */}
                    <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
                    <Stack.Screen name="settings" options={{ headerShown: false }} />
                    <Stack.Screen name="payment" options={{ headerShown: false }} />

                    {/* Calendar */}
                    <Stack.Screen name="calendar" options={{ headerShown: false }} />

                    {/* Course (nested stack) */}
                    <Stack.Screen name="course" options={{ headerShown: false }} />

                    {/* Info (nested stack) */}
                    <Stack.Screen name="info" options={{ headerShown: false }} />

                    {/* Tests (nested stack) */}
                    <Stack.Screen name="tests" options={{ headerShown: false }} />

                    {/* Not found */}
                    <Stack.Screen name="+not-found" />
                  </ThemedStack>
                  <RatePromptSheet />
                  <Toast config={toastConfig} topOffset={56} />
                  <ThemedStatusBar />
                </CustomThemeProvider>
                </TourProvider>
             </AppSyncWrapper>
            </SQLiteProvider>
          </Suspense>
        
      </AuthProvider>
    
  );
}
