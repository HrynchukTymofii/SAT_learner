import { useAuth } from "@/context/AuthContext";
import { clearOfflineQueue, processOfflineQueue } from "@/lib/offlineQueue";
import { endUserSession } from "@/lib/session";
import * as Network from "expo-network";
import * as SecureStore from "expo-secure-store";
import { useSQLiteContext } from "expo-sqlite";
import Purchases from "react-native-purchases";

// Local tables with the logged-in user's progress. Content tables are shared and stay
const USER_TABLES = ["quiz_results", "user_quiz_questions", "lesson_progress"];

// How long logout waits for queued offline actions to reach the server
const FLUSH_TIMEOUT_MS = 3000;

// Clears everything that belongs to the current user. The caller navigates and shows the toast
export function useLogout() {
  const { token, setToken, setUser } = useAuth();
  const db = useSQLiteContext();

  return async function logout({ flushQueue = true }: { flushQueue?: boolean } = {}) {
    // A background sync that finishes after this must not bring the user back
    endUserSession();

    // Try to send this user's offline actions before they're dropped (skipped after account deletion)
    if (flushQueue && token) {
      try {
        const state = await Network.getNetworkStateAsync();
        if (state.isConnected) {
          await Promise.race([
            processOfflineQueue(token),
            new Promise((resolve) => setTimeout(resolve, FLUSH_TIMEOUT_MS)),
          ]);
        }
      } catch (e) {
        console.warn("⚠️ Offline queue flush on logout failed", e);
      }
    }

    try {
      // Detach this device from the user's RevenueCat identity
      if (!(await Purchases.isAnonymous())) await Purchases.logOut();
    } catch (e) {
      console.warn("⚠️ RevenueCat logout skipped", e);
    }

    await clearOfflineQueue();
    await SecureStore.deleteItemAsync("paused_exam");

    try {
      await db.withTransactionAsync(async () => {
        for (const table of USER_TABLES) {
          await db.execAsync(`DELETE FROM ${table}`);
        }
      });
    } catch (e) {
      console.error("❌ Failed to clear local user data", e);
    }

    await setToken(null);
    await setUser(null);
  };
}
