import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { useRouter, useLocalSearchParams } from "expo-router";
import TopBlur from "@/components/ui/TobBlur";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import ConfettiCannon from "react-native-confetti-cannon";

export default function LessonScreen() {
  const router = useRouter();
  const { allItems: allItemsStr, currentIndex: currentIndexStr } = useLocalSearchParams<{
    allItems: string;
    currentIndex: string;
  }>();
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);

  const allItems = JSON.parse(allItemsStr || "[]");
  const currentIndex = Number(currentIndexStr) || 0;

  const currentItem = allItems[currentIndex];
  const nextItem = allItems[currentIndex + 1];



  const handleNext = () => {
    setShowConfetti(true);

    setTimeout(() => {
      if (nextItem) {
        router.push({
          pathname: `/course/${nextItem.chapterId}/${nextItem.type}/${nextItem.id}` as any,
          params: { allItems: JSON.stringify(allItems), currentIndex: currentIndex + 1 },
        });
      }
      setShowConfetti(false);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <TopBlur />
      <Pressable
        onPress={() => router.push("/")}
        className="flex-row items-center mt-4 ml-6"
      >
        <ArrowLeft size={20} color="gray" />
        <Text className="ml-2 text-gray-800 text-base dark:text-gray-400">
          Return to course
        </Text>
      </Pressable>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-4 py-2">
          <Text className="text-2xl font-bold px-2">{currentItem?.title}</Text>
        </View>

        {currentItem?.type === "lesson" && (
          <View className="flex-1">
            <WebView
              source={{
                uri: `https://sat-ecosystem.vercel.app/expo-course/${currentItem.chapterId}/lessons/${currentItem.id}`,
              }}
              style={{ flex: 1 }}
              originWhitelist={["*"]}
              javaScriptEnabled
              domStorageEnabled
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
          
            {loading && (
              <View className="absolute inset-0 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-2">Loading...</Text>
              </View>
            )}

          </View>
        )}

        {nextItem && (
          <View className="p-4">
            <TouchableOpacity
              onPress={handleNext}
              className="bg-blue-600 py-3 rounded-xl"
            >
              <Text className="text-white text-center font-semibold">
                Go to {nextItem.title}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {showConfetti && (
        <ConfettiCannon count={120} origin={{ x: -10, y: 0 }} fadeOut={true} />
      )}
    </SafeAreaView>
  );
}
