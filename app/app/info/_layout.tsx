import { Stack } from "expo-router";

export default function InfoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Info Hub */}
      <Stack.Screen name="index" options={{ title: "SAT Resources" }} />

      {/* Articles */}
      <Stack.Screen name="articles/what-is-sat" options={{ title: "What is SAT?" }} />
      <Stack.Screen name="articles/how-sat-scored" options={{ title: "How SAT is Scored" }} />
      <Stack.Screen name="articles/test-dates" options={{ title: "Test Dates & Registration" }} />
    </Stack>
  );
}
