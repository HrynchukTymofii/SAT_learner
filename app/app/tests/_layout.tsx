import { Stack } from "expo-router";

export default function TestsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
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
