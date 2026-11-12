import * as SecureStore from "expo-secure-store";

/**
 * Course admins (see website lib/admin-check.ts) always get PRO from the server.
 * In Settings they can switch to "preview as free student"; that choice is kept on this phone.
 */
const KEY = "adminPreviewFree";

export async function getAdminPreviewFree() {
  try {
    return (await SecureStore.getItemAsync(KEY)) === "1";
  } catch {
    return false;
  }
}

export async function setAdminPreviewFree(on: boolean) {
  try {
    await SecureStore.setItemAsync(KEY, on ? "1" : "0");
  } catch {}
}
