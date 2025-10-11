import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Pressable, ActivityIndicator } from "react-native";
import { useAuth, UserType } from "@/context/AuthContext";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { BookOpen, Brain, Calendar, CheckCircle, Star, Trophy, Zap } from "lucide-react-native";
import { useRouter } from "expo-router";
import { getUserData } from "@/lib/api/user";
import Toast from "react-native-toast-message";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";

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

  return <Text style={{ fontSize: 20, fontWeight: "bold" }}>{displayValue}</Text>;
};

const AchievementBadge = ({ achievement }: { achievement: typeof mockUserData.achievements[0] }) => {
  const Icon = achievement.icon;

  // Base colors
  const bgColors: Record<string, string> = {
    blue: achievement.unlocked ? "#60A5FA" : "#E5E7EB",    // lighter blue
    amber: achievement.unlocked ? "#FBBF24" : "#E5E7EB",   // lighter amber
    green: achievement.unlocked ? "#34D399" : "#E5E7EB",   // softer green
    purple: achievement.unlocked ? "#C084FC" : "#E5E7EB",
    gray: "#E5E7EB",
  };

  // Contrasting text colors
  const textColors: Record<string, string> = {
    blue: achievement.unlocked ? "#EFF6FF" : "#9CA3AF",
    amber: achievement.unlocked ? "#FFF7ED" : "#9CA3AF",
    green: achievement.unlocked ? "#ECFDF5" : "#9CA3AF",
    purple: achievement.unlocked ? "#F3E8FF" : "#9CA3AF",
    gray: "#9CA3AF",
  };

  // Shadow for 3D effect
  const shadowColors: Record<string, string> = {
    blue: "#1E40AF",
    amber: "#B45309",
    green: "#047857",
    purple: "#5B21B6",
    gray: "#9CA3AF",
  };

  return (
    <Pressable
      disabled={!achievement.unlocked}
      style={{
        width: "48%",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: bgColors[achievement.color],
        backgroundColor: bgColors[achievement.color],
        opacity: achievement.unlocked ? 1 : 0.6,
        padding: 12,
        marginBottom: 12,
        alignItems: "center",

        // 3D Shadow effect
        shadowColor: shadowColors[achievement.color],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <View
          style={{
            padding: 8,
            borderRadius: 999,
            backgroundColor: achievement.unlocked
              ? "rgba(255,255,255,0.7)"
              : "rgba(229, 231, 235,0.5)",
            marginBottom: 4,
          }}
        >
          <Icon size={24} color='white' />
        </View>
        <Text
          style={{
            fontWeight: "600",
            color: 'white',
            textAlign: "center",
          }}
        >
          {achievement.title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: achievement.unlocked ? "#f2f2f2" : "#475569",
            textAlign: "center",
            opacity: 0.9,
          }}
        >
          {achievement.description}
        </Text>
      </View>

      {achievement.unlocked && (
        <View
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            backgroundColor: "#fff",
            borderRadius: 999,
          }}
        >
          <CheckCircle size={20} color="#16A34A" />
        </View>
      )}
    </Pressable>
  );
};


export default function ProfileScreen() {
  const { token, setToken, user, setUser } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
          const mappedUser: UserType = { ...res.user, categories: res.user.league };
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
    setUser(null);
    router.replace("/");
    Toast.show({ type: "success", text1: "Ви вийшли з акаунту", position: "top", visibilityTime: 700 });
  };

  if (loading) return <ActivityIndicator size="large" color="#22d3ee" style={{ flex: 1, justifyContent: "center", alignItems: "center" }} />;
  if (error || !user)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16, backgroundColor: isDark ? "#0f172a" : "#f9fafb" }}>
        <Text style={{ color: "red", fontSize: 16, marginBottom: 4 }}>Помилка завантаження профілю</Text>
        {error && <Text style={{ color: isDark ? "#CBD5E1" : "#6B7280" }}>{error}</Text>}
      </View>
    );

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80, backgroundColor: isDark ? "#0f172a" : "#f9fafb" }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View
        style={{
          backgroundColor: isDark ? "#1e293b" : "#fff",
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          padding: 16,
          paddingTop: 32,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        {user.image ? (
          <Image source={{ uri: user.image }} style={{ width: 80, height: 80, borderRadius: 999, borderWidth: 2, borderColor: "#fff", marginRight: 12 }} />
        ) : (
          <View style={{ width: 80, height: 80, borderRadius: 999, borderWidth: 2, borderColor: "#fff", backgroundColor: "#22d3ee", marginRight: 12, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>{initials}</Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: isDark ? "#F1F5F9" : "#1f2937" }}>{user.name}</Text>
          <Text style={{ color: isDark ? "#CBD5E1" : "#6B7280" }}>{user.email}</Text>
          {user.isPro && <Text style={{ color: "#7C3AED", marginTop: 2, fontWeight: "600" }}>Pro League</Text>}
        </View>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", padding: 16 }}>
  <LinearGradient
    colors={["#3B82F6", "#60A5FA"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      width: "48%",
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 6,
    }}
  >
    <MaterialIcons name="emoji-events" size={32} color="#fff" />
    <AnimatedNumber value={mockUserData.stats.totalPoints} />
    <Text style={{ color: "#fff", fontWeight: "600" }}>Total Points</Text>
  </LinearGradient>

  <LinearGradient
    colors={["#22C55E", "#4ADE80"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      width: "48%",
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 6,
    }}
  >
    <MaterialIcons name="menu-book" size={32} color="#fff" />
    <AnimatedNumber value={mockUserData.stats.lessonsCompleted} />
    <Text style={{ color: "#fff", fontWeight: "600" }}>Lessons Done</Text>
  </LinearGradient>

  <LinearGradient
    colors={["#A78BFA", "#C4B5FD"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      width: "48%",
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 6,
    }}
  >
    <MaterialIcons name="track-changes" size={32} color="#fff" />
    <AnimatedNumber value={mockUserData.stats.quizzesTaken} />
    <Text style={{ color: "#fff", fontWeight: "600" }}>Quizzes Taken</Text>
  </LinearGradient>

  <LinearGradient
    colors={["#FACC15", "#FDE68A"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      width: "48%",
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 6,
    }}
  >
    <MaterialIcons name="star" size={32} color="#fff" />
    <AnimatedNumber value={mockUserData.stats.averageSATScore} />
    <Text style={{ color: "#fff", fontWeight: "600" }}>Avg SAT Score</Text>
  </LinearGradient>
</View>

      {/* Achievements */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 8 }}>
        <Trophy size={20} color="#D97706" />
        <Text style={{ fontSize: 18, fontWeight: "bold", color: isDark ? "#F1F5F9" : "#1f2937", marginLeft: 8 }}>Achievements</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 16 }}>
        {mockUserData.achievements.map((ach) => (
          <AchievementBadge key={ach.id} achievement={ach} />
        ))}
      </View>

      <TouchableOpacity
  onPress={() => router.push("/info")} // Change to your actual SAT info page path
  style={{
    backgroundColor: isDark ? "#1e293b" : "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  }}
>
  {/* Icon */}
  <View
    style={{
      width: 48,
      height: 48,
      borderRadius: 999,
      backgroundColor: "#22d3ee",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    }}
  >
    <BookOpen size={24} color="#fff" />
  </View>

  {/* Text Content */}
  <View style={{ flex: 1 }}>
    <Text style={{ fontSize: 16, fontWeight: "bold", color: isDark ? "#F1F5F9" : "#1f2937", marginBottom: 4 }}>
      About SAT
    </Text>
    <Text style={{ fontSize: 14, color: isDark ? "#CBD5E1" : "#6B7280", lineHeight: 20 }}>
      Learn how the SAT works, what sections it has, and tips to improve your score.
    </Text>
  </View>

  {/* Arrow Icon */}
  <MaterialIcons name="arrow-forward-ios" size={20} color={isDark ? "#CBD5E1" : "#6B7280"} />
</TouchableOpacity>

      {/* Account Settings */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: isDark ? "#F1F5F9" : "#1f2937", marginTop: 16, marginBottom: 8 }}>Account Settings</Text>
        <TouchableOpacity style={{ backgroundColor: isDark ? "#1e293b" : "#fff", padding: 12, borderRadius: 16, flexDirection: "row", alignItems: "center", marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
          <MaterialIcons name="person" size={20} color={isDark ? "#CBD5E1" : "#6B7280"} />
          <Text style={{ marginLeft: 8, color: isDark ? "#F1F5F9" : "#1f2937" }}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ backgroundColor: isDark ? "#1e293b" : "#fff", padding: 12, borderRadius: 16, flexDirection: "row", alignItems: "center", marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
          <MaterialIcons name="lock" size={20} color={isDark ? "#CBD5E1" : "#6B7280"} />
          <Text style={{ marginLeft: 8, color: isDark ? "#F1F5F9" : "#1f2937" }}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ backgroundColor: isDark ? "#1e293b" : "#fff", padding: 12, borderRadius: 16, flexDirection: "row", alignItems: "center", marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
          <MaterialIcons name="credit-card" size={20} color={isDark ? "#CBD5E1" : "#6B7280"} />
          <Text style={{ marginLeft: 8, color: isDark ? "#F1F5F9" : "#1f2937" }}>Manage Subscription</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          style={{ backgroundColor: isDark ? "#1e293b" : "#fff", padding: 12, borderRadius: 16, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
        >
          <MaterialIcons name="logout" size={20} color="red" />
          <Text style={{ marginLeft: 8, color: "red" }}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
