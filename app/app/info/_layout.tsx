import { Stack } from "expo-router";
import { usePalette } from "@/constants/palette";

export default function InfoLayout() {
  // App background behind every screen, so pushes and swipes back never flash white
  const c = usePalette();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
      {/* Info Hub */}
      <Stack.Screen name="index" options={{ title: "SAT Resources" }} />

      {/* Articles */}
      <Stack.Screen name="articles/what-is-sat" options={{ title: "What is SAT?" }} />
      <Stack.Screen name="articles/how-sat-scored" options={{ title: "How SAT is Scored" }} />
      <Stack.Screen name="articles/test-dates" options={{ title: "Test Dates & Registration" }} />
    </Stack>
  );
}
