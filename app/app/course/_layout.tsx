import { Stack } from "expo-router";

export default function CourseLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Chapter Details */}
      <Stack.Screen name="[chapterId]/index" options={{ title: "Chapter" }} />

      {/* Lesson */}
      <Stack.Screen name="[chapterId]/lesson/[lessonId]/index" options={{ title: "Lesson" }} />

      {/* Quiz */}
      <Stack.Screen name="[chapterId]/quiz/[quizId]/index" options={{ title: "Quiz" }} />
    </Stack>
  );
}
