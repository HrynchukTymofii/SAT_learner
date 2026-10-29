import { UserType } from "@/context/AuthContext";
import { getUserData, upgradeToSync } from "./api/user";
import { useUserDatabase } from "./db/fetchDb";
import { useQuizDatabase } from "./db/quiz";
import { checkAppNeedSync, checkForQuizUpdates } from "./api/quiz";
import { processOfflineQueue } from "./offlineQueue";
import { saveToken } from "./secureStorage";
import { getUserSession } from "./session";
import { useLogout } from "@/hooks/useLogout";
import Purchases from "react-native-purchases";
import { router } from "expo-router";


interface LoadUserOptions {
  token: string;
  setUser: (user: UserType | null) => void;
  setToken?: (token: string | null) => void;
  forceSync?: boolean;
}

export interface LoadUserResult {
  tokenValid: boolean;
  user: UserType | null;   // fresh user from the server, or null if it couldn't be loaded
}


export function useLoadUserInBackground() {
  const { fetchAndStoreUserData } = useUserDatabase();
  const { applyAllQuizUpdatesLocally, fetchLocalQuizTimestamps  } = useQuizDatabase();
  const logout = useLogout();

  const handleCheckForUpdates = async (token: string) => {
    try {
      if (!token) {
        router.replace("/login");
        return;
      }

      const localUpdatedAt = await fetchLocalQuizTimestamps();
      //console.log("Local timestamps:", JSON.stringify(localUpdatedAt));

      const res = await checkForQuizUpdates(token, localUpdatedAt);
      if (!res || !res.updates?.length) {
        // Alert.alert("✅ All quizzes are up to date.");
        return;
      }

      //console.log(JSON.stringify(res.updates))

      const applied = await applyAllQuizUpdatesLocally(res.updates);
      // if (applied.success) {
      //   // Alert.alert("✅ Update Complete", "Your quizzes and questions are now synced!");
      // } else {
      //   Alert.alert("❌ Update failed", applied.error || "Unknown error");
      // }
    } catch (error) {
      console.error("Error in handleCheckForUpdates:", error);
      // Alert.alert("⚠️ Update Error", "Something went wrong while checking for updates.");
    }
  };

  async function loadUserInBackground(
    { token, forceSync = false, setUser, setToken }: LoadUserOptions): Promise<LoadUserResult>
  {
    const startedSession = getUserSession();
    try {
      const res = await getUserData(token);

      // Logged out while the request was running
      if (startedSession !== getUserSession()) return { tokenValid: false, user: null };

      if (res.success) {
        // Server sends a fresh token once the current one is a day old
        const { token: refreshedToken, ...serverUser } = res.user;
        if (refreshedToken) await saveToken(refreshedToken);

        const mappedUser: UserType = {
          ...serverUser,
          categories: serverUser.league,
        };
        setUser(mappedUser);

        try {
          // Link this device's RevenueCat identity to the backend user id
          const rcUserId = res.user.userId;

          if (rcUserId) {
            const currentRcUserId = await Purchases.getAppUserID();

            // Only log in if the user is different
            if (currentRcUserId !== rcUserId) {
              await Purchases.logIn(rcUserId);
              //console.log("✅ RevenueCat logged in:", rcUserId);
            }
          }
        } catch (e) {
          console.warn("⚠️ RevenueCat login failed", e);
        }

        // Push offline changes first, so the server copy we download includes them
        await processOfflineQueue(token);

        if (forceSync || serverUser.needSync) {
          await fetchAndStoreUserData(token);
          await upgradeToSync(token);
          const appRes = await checkAppNeedSync();
          if (appRes?.app?.needSync) {
            handleCheckForUpdates(token);
          }
        }

        return { tokenValid: true, user: mappedUser };
      } else {
        // 401: token invalid or expired. 404: the account no longer exists (deleted)
        if (res.status === 401 || res.status === 404) {
          // Same cleanup as a manual logout; the queue can't be sent with a dead token
          await logout({ flushQueue: false });
          router.replace("/login");
          return { tokenValid: false, user: null };
        }
        console.error("Failed to load user:", res.error);
      }
    } catch (err) {
      console.error("Error loading user:", err);
    }
    return { tokenValid: true, user: null };
  }
  
  return { loadUserInBackground };
}

