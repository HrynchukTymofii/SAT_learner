import { Stack } from "expo-router";
import { usePalette } from "@/constants/palette";

export default function TestsLayout() {
  // App background behind every screen, so pushes and swipes back never flash white
  const c = usePalette();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
      {/* By Topic Tests */}
      <Stack.Screen name="by-topic/index" options={{ title: "Tests by Topic" }} />
      <Stack.Screen name="by-topic/[quizId]/index" options={{ title: "Topic Quiz" }} />

      {/* Exams */}
      <Stack.Screen name="exams/index" options={{ title: "Practice Exams" }} />
      <Stack.Screen name="exams/[examId]/index" options={{ title: "Full Exam" }} />

      {/* Saved Questions */}
      <Stack.Screen name="saved/index" options={{ title: "Saved Questions" }} />
      <Stack.Screen name="saved/[quizId]/index" options={{ title: "Saved Quiz" }} />

      {/* Wrong Answers */}
      <Stack.Screen name="wrong/index" options={{ title: "Wrong Answers" }} />
      <Stack.Screen name="wrong/[quizId]/index" options={{ title: "Wrong Quiz" }} />

      {/* Improve */}
      {/* <Stack.Screen name="improve/index" options={{ title: "Improve" }} />
      <Stack.Screen name="improve/[quizId]/index" options={{ title: "Improve Quiz" }} /> */}
    </Stack>
  );
}
