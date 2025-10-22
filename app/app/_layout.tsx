import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/hooks/useColorScheme";
import Toast from "react-native-toast-message";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Suspense, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { SQLiteProvider } from "expo-sqlite";
import CustomPreloadScreen from "@/components/ui/CustomPreloadScreen";
import * as Network from 'expo-network';

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import Purchases, {LOG_LEVEL} from "react-native-purchases"
import { AppState, Platform } from "react-native";
import { useLoadUserInBackground } from "@/lib/user";
import { processOfflineQueue } from "@/lib/offlineQueue";
import { upgradeToPro } from "@/lib/api/user";


configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

function AppSyncWrapper({ children }: { children: React.ReactNode }) {
  const { token, user, setUser } = useAuth();
  const [isOffline, setIsOffline] = useState(false);
  const { loadUserInBackground } = useLoadUserInBackground();

  const syncIfOnline = async () => {
    if (!token) return;

    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        setIsOffline(true);
        return;
      }
      

      setIsOffline(false);
      await loadUserInBackground({ token, setUser });  //forceSync: true,
      await processOfflineQueue(token);

       if (user && !user.isPro) {
        const customerInfo = await Purchases.getCustomerInfo();

        const activePro = customerInfo.entitlements.active["PRO for year"];
        console.log(activePro)

        if (activePro) {
          const plan =
            activePro.productIdentifier === "test_year"
              ? "$rc_annual"
              : null;
          
          if (!plan) {
            console.warn("Unknown productIdentifier:", activePro.productIdentifier);
            return;
          }

          const res = await upgradeToPro(token, plan);

          if (res.success) {
            if(user) setUser({ ...user, isPro: true });
            console.log("User upgraded to PRO via RevenueCat sync");
          } else {
            console.warn("Failed to sync PRO status:", res.error);
          }
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

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === "ios") {
      Purchases.configure({ apiKey: "appl_plYVBUscFYEJQnxkmHBsnMRhbIa" });
    } else if (Platform.OS === "android") {
      Purchases.configure({ apiKey: "goog_RDVEiwhMsfMcTDNFxFdGkPiMLes" });
    }
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

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
  if (!loaded || onboardingDone === null) return null;

  // Otherwise show the normal app
  return (
    <AuthProvider>
      <Suspense fallback={<CustomPreloadScreen />}>
        <SQLiteProvider
          databaseName="satprep.db"
          assetSource={{ assetId: require("@/assets/databases/satprep.db") }}
          useSuspense
        >
          <AppSyncWrapper>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="onboarding"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
              <Toast />
              <StatusBar style="auto" />
            </ThemeProvider>
          </AppSyncWrapper>
        </SQLiteProvider>
      </Suspense>
    </AuthProvider>
  );
}
