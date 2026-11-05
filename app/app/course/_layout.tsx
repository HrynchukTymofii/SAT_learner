import { Stack } from "expo-router";
import { usePalette } from "@/constants/palette";

export default function CourseLayout() {
  // App background behind every screen, so pushes and swipes back never flash white
  const c = usePalette();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
      {/* Chapter Details */}
      <Stack.Screen name="[chapterId]/index" options={{ title: "Chapter" }} />

      {/* Lesson */}
      <Stack.Screen name="[chapterId]/lesson/[lessonId]/index" options={{ title: "Lesson" }} />

      {/* Quiz */}
      <Stack.Screen name="[chapterId]/quiz/[quizId]/index" options={{ title: "Quiz" }} />
    </Stack>
  );
}
