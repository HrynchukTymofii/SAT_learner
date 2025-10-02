import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Pressable, ActivityIndicator } from "react-native";
import { useAuth, UserType } from "@/context/AuthContext";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { BookOpen, Brain, Calendar, CheckCircle, Star, Trophy, Zap } from "lucide-react-native";
import { useRouter } from "expo-router";
import { getUserData } from "@/lib/api/user";
import Toast from "react-native-toast-message";

const mockUserData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  league: "Pro",
  joinDate: "2023-09-15",
  stats: {
    totalPoints: 2847,
    lessonsCompleted: 42,
    quizzesTaken: 28,
    averageSATScore: 1340,
  },
  achievements: [
    {
      id: 1,
      title: "First Steps",
      description: "Completed First Lesson",
      icon: BookOpen,
      unlocked: true,
      color: "blue",
    },
    { id: 2, title: "High Scorer", description: "Scored 700+", icon: Trophy, unlocked: true, color: "amber" },
    {
      id: 3,
      title: "Consistent",
      description: "Active 7 days straight",
      icon: Calendar,
      unlocked: true,
      color: "green",
    },
    { id: 4, title: "Math Master", description: "Aced 10 Math quizzes", icon: Brain, unlocked: true, color: "purple" },
    {
      id: 5,
      title: "Speed Reader",
      description: "Complete 5 Reading sections under time",
      icon: Zap,
      unlocked: false,
      color: "gray",
    },
    {
      id: 6,
      title: "Perfect Practice",
      description: "Score 100% on any quiz",
      icon: Star,
      unlocked: false,
      color: "gray",
    },
  ],
};

// Animated number
const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const steps = 60;
    const increment = value / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentValue = Math.min(increment * currentStep, value);
      setDisplayValue(Math.round(currentValue));
      if (currentStep >= steps) clearInterval(timer);
    }, 20);

    return () => clearInterval(timer);
  }, [value]);

  return <Text className="text-2xl font-bold">{displayValue}</Text>;
};


const AchievementBadge = ({
  achievement,
}: {
  achievement: typeof mockUserData.achievements[0]
}) => {
  const colorClasses: Record<string, string> = {
    blue: achievement.unlocked
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-slate-100 text-slate-400 border-slate-200",
    amber: achievement.unlocked
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-slate-100 text-slate-400 border-slate-200",
    green: achievement.unlocked
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-slate-100 text-slate-400 border-slate-200",
    purple: achievement.unlocked
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : "bg-slate-100 text-slate-400 border-slate-200",
    gray: "bg-slate-100 text-slate-400 border-slate-200",
  }

  const Icon = achievement.icon

  return (
    <Pressable
      disabled={!achievement.unlocked}
      className={`w-[48%] relative p-4 rounded-xl border-2 ${colorClasses[achievement.color]} ${
        achievement.unlocked ? "opacity-100" : "opacity-60"
      }`}
    >
      <View className="flex flex-col items-center text-center gap-y-2">
        {/* Icon circle */}
        <View
          className={`p-3 rounded-full ${
            achievement.unlocked ? "bg-white/50" : "bg-slate-200/50"
          }`}
        >
          <Icon size={24} className={achievement.unlocked ? "text-slate-700" : "text-slate-400"} />
        </View>

        {/* Title + description */}
        <View>
          <Text
            className={`font-semibold text-sm ${
              achievement.unlocked ? "text-slate-900" : "text-slate-400"
            }`}
          >
            {achievement.title}
          </Text>
          <Text
            className={`text-xs opacity-75 ${
              achievement.unlocked ? "text-slate-600" : "text-slate-400"
            }`}
          >
            {achievement.description}
          </Text>
        </View>

        {/* Checkmark badge */}
        {achievement.unlocked && (
          <View className="absolute -top-2 -right-2 bg-white rounded-full">
            <CheckCircle size={20} color="#16a34a" />
          </View>
        )}
      </View>
    </Pressable>
  )
}

export default function ProfileScreen({ navigation }: any) {
  const { token, setToken, user, setUser } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push({ pathname: "/login", params: { returnUrl: "/profile" } });
      return;
    }

    const load = async () => {
      try {
        const res = await getUserData(token);
        if (res.success) {
          const mappedUser: UserType = {
            ...res.user,
            categories: res.user.league,
          };
          setUser(mappedUser);
        } else {
          setError(res.error || "Помилка завантаження");
        }
      } catch {
        setError("Сталася неочікувана помилка");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    setUser(null)
    router.replace("/");
    Toast.show({
      type: "success",
      text1: "Ви вийшли з акаунту",
      position: "top",
      visibilityTime: 700
    });
  };

  if (loading) {
    return (
      <ActivityIndicator />
    );
  }

  if (error || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-lg text-red-600">Помилка завантаження профілю</Text>
        {error && <Text className="text-gray-500 mt-2">{error}</Text>}
      </View>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white rounded-b-2xl p-4 pt-12 flex-row items-center gap-x-4 shadow">
        {/* <Avatar
          rounded
          size={80}
          source={user.avatar ? { uri: user.avatar } : undefined}
          title={user.name ? user.name[0] : "S"}
        /> */}

        {user.image ? (
            <Image
              source={{ uri: user.image }}
              className="w-20 h-20 rounded-full border-2 border-white"
            />
          ) : (
            <View className="w-20 h-20 rounded-full border-2 border-white bg-green-700 flex items-center justify-center">
              <Text className="text-white text-2xl font-bold">{initials}</Text>
            </View>
          )}
        <View className="flex-1">
          <Text className="text-xl font-bold">{user.name}</Text>
          <Text className="text-gray-600">{user.email}</Text>
          {user.isPro && <Text className="mt-1 text-purple-700 font-semibold">Pro League</Text>}
          <Text className="text-gray-500 text-sm">
            Joined {new Date(mockUserData.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </Text>
        </View>
      </View>

      <View className=" p-4">

      {/* Stats */}
      <View className="mt-4 flex flex-row flex-wrap justify-between">
        <View className="w-[48%] bg-blue-100 p-4 rounded-xl items-center mb-4">
            <MaterialIcons name="emoji-events" size={32} color="blue" />
            <AnimatedNumber value={mockUserData.stats.totalPoints} />
            <Text>Total Points</Text>
        </View>

        <View className="w-[48%] bg-green-100 p-4 rounded-xl items-center mb-4">
            <MaterialIcons name="menu-book" size={32} color="green" />
            <AnimatedNumber value={mockUserData.stats.lessonsCompleted} />
            <Text>Lessons Done</Text>
        </View>

        <View className="w-[48%] bg-purple-100 p-4 rounded-xl items-center mb-4">
            <MaterialIcons name="track-changes" size={32} color="purple" />
            <AnimatedNumber value={mockUserData.stats.quizzesTaken} />
            <Text>Quizzes Taken</Text>
        </View>

        <View className="w-[48%] bg-amber-100 p-4 rounded-xl items-center mb-4">
            <MaterialIcons name="star" size={32} color="orange" />
            <AnimatedNumber value={mockUserData.stats.averageSATScore} />
            <Text>Avg SAT Score</Text>
        </View>
      </View>

      {/* Achievements */}
      <View className="flex-row items-center gap-2 mb-2">
        <Trophy size={20} color="#d97706" /> 
        <Text className="text-xl font-bold text-slate-900">Achievements</Text>
        </View>
      <View className="flex-row flex-wrap justify-between gap-4">
        {mockUserData.achievements.map((ach) => (
          <AchievementBadge key={ach.id} achievement={ach} />
        ))}
      </View>

      {/* Account Settings */}
      <Text className="text-lg font-bold mt-6 mb-2">Account Settings</Text>
      <View className="gap-y-2 mb-32">
        <TouchableOpacity className="bg-white p-4 rounded-xl flex-row items-center gap-x-3 shadow">
          <MaterialIcons name="person" size={20} color="gray" />
          <Text>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white p-4 rounded-xl flex-row items-center gap-x-3 shadow">
          <MaterialIcons name="lock" size={20} color="gray" />
          <Text>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white p-4 rounded-xl flex-row items-center gap-x-3 shadow">
          <MaterialIcons name="credit-card" size={20} color="gray" />
          <Text>Manage Subscription</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white p-4 rounded-xl flex-row items-center gap-x-3 shadow" onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="red" />
          <Text className="text-red-600">Log Out</Text>
        </TouchableOpacity>
      </View>
      </View>
    </ScrollView>
  );
}
