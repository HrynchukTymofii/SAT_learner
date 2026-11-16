import api from "./axios";
import Constants from "expo-constants";
import { Platform, Linking } from "react-native";

// Get current app version from expo config
export const getCurrentAppVersion = (): string => {
  return Constants.expoConfig?.version || "1.0.0";
};

// Fetch required version from backend
export const fetchRequiredVersion = async (): Promise<{
  version: string;
  forceUpdate: boolean;
  updateMessage?: string;
} | null> => {
  try {
    const response = await api.get("/app-version");
    return response.data;
  } catch (error) {
    console.warn("Failed to fetch app version:", error);
    return null;
  }
};

// Compare semantic versions (returns true if required > current)
export const isUpdateRequired = (
  currentVersion: string,
  requiredVersion: string
): boolean => {
  const current = currentVersion.split(".").map(Number);
  const required = requiredVersion.split(".").map(Number);

  for (let i = 0; i < Math.max(current.length, required.length); i++) {
    const currentPart = current[i] || 0;
    const requiredPart = required[i] || 0;

    if (requiredPart > currentPart) return true;
    if (requiredPart < currentPart) return false;
  }

  return false;
};

// Store links
const APP_STORE_URL = "https://apps.apple.com/app/sat-math-learner/id6738790335";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.hrynchuk.satprepapp";

export const openAppStore = async (): Promise<void> => {
  const url = Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      console.warn("Cannot open store URL:", url);
    }
  } catch (error) {
    console.error("Failed to open app store:", error);
  }
};

// Check for updates and return update info if needed
export const checkForUpdates = async (): Promise<{
  updateRequired: boolean;
  forceUpdate: boolean;
  updateMessage?: string;
  requiredVersion?: string;
}> => {
  const currentVersion = getCurrentAppVersion();
  const versionInfo = await fetchRequiredVersion();

  if (!versionInfo) {
    return { updateRequired: false, forceUpdate: false };
  }

  const updateRequired = isUpdateRequired(currentVersion, versionInfo.version);

  return {
    updateRequired,
    forceUpdate: versionInfo.forceUpdate && updateRequired,
    updateMessage: versionInfo.updateMessage,
    requiredVersion: versionInfo.version,
  };
};
