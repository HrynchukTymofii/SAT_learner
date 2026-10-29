import AsyncStorage from "@react-native-async-storage/async-storage";

// When the app asks for a rating: right after a good moment, never twice in a row,
// and never again once the user rated. Kept on this device only.

export type RateSource = "exam_finished" | "topic_finished" | "profile_button";

const STATE_KEY = "ratePrompt";
// Set by the old prompt (rated or dismissed); counts as rated
const LEGACY_KEY = "hasRatedApp";

// After "not now", wait this long before asking again, and stop after this many
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_DISMISSALS = 2;
// Let the results screen show before the sheet slides up
const DELAY_MS = 1200;

interface PromptState {
  rated?: boolean;
  dismissals?: number;
  lastShownAt?: number;
}

const listeners = new Set<(source: RateSource) => void>();

// RatePromptSheet (mounted once in the root layout) subscribes here
export function onRatePrompt(listener: (source: RateSource) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Opens the sheet now, whatever the history (the profile "Rate the app" row)
export function openRatePrompt(source: RateSource) {
  listeners.forEach((l) => l(source));
}

async function load(): Promise<PromptState> {
  try {
    if ((await AsyncStorage.getItem(LEGACY_KEY)) === "true") return { rated: true };
    return JSON.parse((await AsyncStorage.getItem(STATE_KEY)) ?? "{}");
  } catch {
    return {};
  }
}

async function save(patch: PromptState) {
  const state = { ...(await load()), ...patch };
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state)).catch(() => {});
}

// Called after a good moment; opens the sheet only when the user is due to be asked.
export async function maybeAskForRating(source: RateSource) {
  const state = await load();
  if (state.rated || (state.dismissals ?? 0) >= MAX_DISMISSALS) return;
  if (state.lastShownAt && Date.now() - state.lastShownAt < COOLDOWN_MS) return;
  await save({ lastShownAt: Date.now() });
  setTimeout(() => openRatePrompt(source), DELAY_MS);
}

// Picked stars: never ask again on this device
export const markRated = () => save({ rated: true });

export async function markDismissed() {
  const state = await load();
  await save({ dismissals: (state.dismissals ?? 0) + 1, lastShownAt: Date.now() });
}
