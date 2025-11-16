import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  useColorScheme,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  MoreVertical,
  CheckCircle2,
  Circle,
  Calendar,
} from "lucide-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useCourseDatabase } from "@/lib/db/course";
import { useSQLiteContext } from "expo-sqlite";

interface RecentChapter {
  id: string;
  title: string;
  progress: number;
  color: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  type: "flashcard" | "explanation" | "exercise";
}

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const {user} = useAuth()
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const { getRecentChapters } = useCourseDatabase();

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recentChapters, setRecentChapters] = useState<RecentChapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(true);

  const [todayTasks, setTodayTasks] = useState<Task[]>([
    {
      id: "1",
      title: 'Learn 20 flashcards in "Cell Biology"',
      completed: false,
      type: "flashcard",
    },
    {
      id: "2",
      title: 'Read the explanation in "Genetics"',
      completed: false,
      type: "explanation",
    },
    {
      id: "3",
      title: 'Complete 10 exercises in "Chemistry"',
      completed: false,
      type: "exercise",
    },
  ]);

  // Load recent chapters on page focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecentChapters();
    }, [])
  );

  const loadRecentChapters = async () => {
    setIsLoadingChapters(true);
    const result = await getRecentChapters();
    if (result.success && result.chapters) {
      // Assign colors to chapters
      const colors = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"];
      const chaptersWithColors = result.chapters.map((chapter, index) => ({
        id: chapter.id,
        title: chapter.title,
        progress: chapter.progress,
        color: colors[index % colors.length],
      }));
      setRecentChapters(chaptersWithColors);
    }
    setIsLoadingChapters(false);
  };

  // Get week dates around selected date
  const getWeekDates = () => {
    const dates = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - 2); // 2 days before

    for (let i = 0; i < 5; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  // Format date helpers
  const formatDay = (date: Date) => {
    return date.getDate();
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Toggle task completion
  const toggleTask = (taskId: string) => {
    setTodayTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Calculate completed tasks
  const completedTasks = todayTasks.filter((task) => task.completed).length;
  const totalTasks = todayTasks.length;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-50"}`} edges={['bottom']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
            style={{ paddingTop: insets.top + 16 }}
          className={`px-6 ${
            isDark ? "bg-gray-900" : "bg-white"
          } border-b ${isDark ? "border-gray-800" : "border-gray-100"}`}
        >
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity activeOpacity={0.7}>
              <Image
                source={isDark ? require("@/assets/images/splash-icon-light.png") : require("@/assets/images/splash-icon-dark.png")}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <Text
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Explore
            </Text>

            <TouchableOpacity activeOpacity={0.7}>
              <MoreVertical
                size={24}
                color={isDark ? "#ffffff" : "#000000"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6">
          {/* Premium Upgrade Banner */}
          {user && !user.isPro && <LinearGradient
            colors={["#06B6D4", "#0891B2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="mt-6 rounded-3xl p-6 overflow-hidden"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-1">
                  Upgrade Premium!
                </Text>
                <Text className="text-white/90 text-sm mb-4">
                  Enjoy all the benefits
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="bg-white rounded-full px-6 py-2 self-start"
                  onPress={() => router.push("/payment")}
                >
                  <Text className="text-cyan-500 font-semibold">Upgrade</Text>
                </TouchableOpacity>
              </View>
              <View className="ml-4">
                <Image
                    source={require("@/assets/images/golden_cap.png")}
                    style={{ width: 108, height: 108 }}
                    resizeMode="contain"
                />
              </View>
            </View>
          </LinearGradient>}

          {/* Recent Chapters */}
          <View className="mt-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text
                className={`text-xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Recent Chapters
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(tabs)/course" as any)}
              >
                <Text className="text-cyan-500 font-semibold">
                  View All →
                </Text>
              </TouchableOpacity>
            </View>

            {isLoadingChapters ? (
              <View className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-8 items-center`}>
                <Text className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Loading chapters...
                </Text>
              </View>
            ) : recentChapters.length === 0 ? (
              <View className={`${isDark ? "bg-gray-800" : "bg-white"} rounded-2xl p-8 items-center`}>
                <Text className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  No chapters started yet
                </Text>
                <Text className={`text-sm text-center mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Start learning to see your recent progress here
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/(tabs)/course" as any)}
                  className="bg-cyan-500 rounded-full px-6 py-2"
                >
                  <Text className="text-white font-semibold">Browse Chapters</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-6 px-6"
              >
                {recentChapters.map((chapter) => (
                  <TouchableOpacity
                    key={chapter.id}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/course/${chapter.id}` as any)}
                    className={`mr-4 ${
                      isDark ? "bg-gray-800" : "bg-white"
                    } rounded-2xl p-4 w-72 border-l-4`}
                    style={{ borderLeftColor: chapter.color }}
                  >
                    {/* Title and Progress */}
                    <View className="flex-row items-start justify-between mb-3">
                      <Text
                        className={`text-lg font-bold flex-1 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {chapter.title}
                      </Text>
                      <View className="ml-2">
                        <View className="relative items-center justify-center">
                          <Text
                            className="text-lg font-bold"
                            style={{ color: chapter.color }}
                          >
                            {chapter.progress}%
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View className={`h-2 rounded-full mb-4 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                      <View
                        className="h-2 rounded-full"
                        style={{
                          width: `${chapter.progress}%`,
                          backgroundColor: chapter.color,
                        }}
                      />
                    </View>

                    {/* Continue Button */}
                    <View
                      className="items-center justify-center py-2 rounded-xl"
                      style={{ backgroundColor: `${chapter.color}20` }}
                    >
                      <Text
                        className="font-semibold"
                        style={{ color: chapter.color }}
                      >
                        Continue Learning
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                <View className="w-6"/>
              </ScrollView>
            )}
          </View>

          {/* Week Calendar */}
          <View className="mt-8">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-6 px-6"
            >
              {weekDates.map((date, index) => {
                const selected = isSameDay(date, selectedDate);
                const today = isToday(date);

                return (
                  <TouchableOpacity
                    key={index}
                    activeOpacity={0.7}
                    onPress={() => setSelectedDate(date)}
                    className={`items-center justify-center mr-4 py-4 px-5 rounded-2xl ${
                      selected
                        ? "bg-cyan-500"
                        : isDark
                        ? "bg-gray-800"
                        : "bg-white"
                    }`}
                    style={{
                      borderBottomWidth: today ? 3 : 0,
                      borderBottomColor: "#06B6D4",
                    }}
                  >
                    <Text
                      className={`text-3xl font-bold mb-1 ${
                        selected
                          ? "text-white"
                          : isDark
                          ? "text-white"
                          : "text-gray-900"
                      }`}
                    >
                      {formatDay(date)}
                    </Text>
                    <Text
                      className={`text-sm ${
                        selected
                          ? "text-white"
                          : isDark
                          ? "text-gray-400"
                          : "text-gray-600"
                      }`}
                    >
                      {formatDayName(date)}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* Calendar Button */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/calendar" as any)}
                className={`items-center justify-center py-4 px-5 rounded-2xl mr-12 ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                style={{
                  borderWidth: 2,
                  borderColor: "#06B6D4",
                  borderStyle: "dashed",
                }}
              >
                <Calendar size={32} color="#06B6D4" />
                <Text
                  className={`text-sm mt-2 font-semibold ${
                    isDark ? "text-cyan-400" : "text-cyan-600"
                  }`}
                >
                  View All
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Today's Study Plan */}
          <View className="mt-8 mb-16">
            <Text
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Your study plan today ({completedTasks}/{totalTasks})
            </Text>

            {todayTasks.map((task, index) => (
              <View key={task.id} className="flex-row items-start mb-6">
                {/* Timeline */}
                <View className="items-center mr-4">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleTask(task.id)}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={24} color="#06B6D4" fill="#06B6D4" />
                    ) : (
                      <Circle size={24} color="#06B6D4" />
                    )}
                  </TouchableOpacity>
                  {index < todayTasks.length - 1 && (
                    <View className="w-0.5 h-16 bg-cyan-500/30 mt-2" />
                  )}
                </View>

                {/* Task Content */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => toggleTask(task.id)}
                  className={`flex-1 ${
                    isDark ? "bg-gray-800" : "bg-white"
                  } rounded-2xl p-4 flex-row items-center`}
                >
                  <View className="mr-3">
                    {task.type === "flashcard" && (
                      <View className="w-10 h-10 bg-cyan-500/10 rounded-xl items-center justify-center">
                        <Text className="text-2xl">📇</Text>
                      </View>
                    )}
                    {task.type === "explanation" && (
                      <View className="w-10 h-10 bg-cyan-500/10 rounded-xl items-center justify-center">
                        <Text className="text-2xl">📄</Text>
                      </View>
                    )}
                    {task.type === "exercise" && (
                      <View className="w-10 h-10 bg-cyan-500/10 rounded-xl items-center justify-center">
                        <Text className="text-2xl">✏️</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    className={`flex-1 ${
                      task.completed
                        ? isDark
                          ? "text-gray-500 line-through"
                          : "text-gray-400 line-through"
                        : isDark
                        ? "text-white"
                        : "text-gray-900"
                    } font-medium`}
                  >
                    {task.title}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button (Alternative to bottom nav) */}
      {/* <TouchableOpacity
        activeOpacity={0.8}
        className="absolute bottom-32 right-6 bg-cyan-500 w-14 h-14 rounded-full items-center justify-center shadow-lg z-10"
        style={{
          shadowColor: "#06B6D4",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => router.push("/")}
      >
        <Text className="text-2xl">🤖</Text>
      </TouchableOpacity>  */}
    </SafeAreaView>
  );
}