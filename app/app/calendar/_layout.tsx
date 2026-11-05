import { Stack } from "expo-router";
import { usePalette } from "@/constants/palette";

export default function CalendarLayout() {
  // App background behind every screen, so pushes and swipes back never flash white
  const c = usePalette();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
      <Stack.Screen name="index" options={{ title: "Study Calendar" }} />
      <Stack.Screen name="day/[date]" options={{ title: "Day Plan" }} />
    </Stack>
  );
}
