import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Linking,
} from "react-native";
import { useAuth, UserType } from "@/context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import {
  BookOpen,
  Brain,
  CheckCircle,
  LucideIcon,
  Mails,
  Settings,
  Star,
  Trophy,
  LogOut,
  User,
  Target,
  Crown,
  ThumbsUp,
} from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { getUserData } from "@/lib/api/user";
import Toast from "react-native-toast-message";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import * as StoreReview from "expo-store-review";
import { useCourseDatabase } from "@/lib/db/course";
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";
import { ContactDialog } from "@/components/modals/ContactDialog";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const AnimatedNumber = ({
  value,
  isDark,
}: {
  value: number;
  isDark: boolean;
}) => {
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

  return (
    <Text
      style={{
        fontSize: 28,
        fontWeight: "bold",
        color: isDark ? "#ffffff" : "#1f2937",
      }}
    >
      {displayValue}
    </Text>
  );
};

export interface Achievement {
  id: number | string;
  title: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
  color: string;
}

const AchievementBadge = ({
  achievement,
  isDark,
}: {
  achievement: Achievement;
  isDark: boolean;
}) => {
  const Icon = achievement.icon;

  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    cyan: { bg: "#06B6D4", text: "#ffffff", icon: "#ffffff" },
    purple: { bg: "#8B5CF6", text: "#ffffff", icon: "#ffffff" },
    amber: { bg: "#F59E0B", text: "#ffffff", icon: "#ffffff" },
    green: { bg: "#10B981", text: "#ffffff", icon: "#ffffff" },
  };

  const colors = colorMap[achievement.color] || colorMap.cyan;

  return (
    <View
      style={{
        width: "48%",
        borderRadius: 16,
        backgroundColor: achievement.unlocked
          ? colors.bg
          : isDark
            ? "#334155"
            : "#e2e8f0",
        padding: 16,
        marginBottom: 16,
        alignItems: "center",
        opacity: achievement.unlocked ? 1 : 0.6,
        shadowColor: achievement.unlocked ? colors.bg : "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: achievement.unlocked
            ? "rgba(255,255,255,0.2)"
            : isDark
              ? "#1e293b"
              : "#cbd5e1",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Icon
          size={24}
          color={
            achievement.unlocked ? colors.icon : isDark ? "#64748b" : "#94a3b8"
          }
        />
      </View>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: achievement.unlocked
            ? colors.text
            : isDark
              ? "#94a3b8"
              : "#64748b",
          textAlign: "center",
          marginBottom: 4,
        }}
      >
        {achievement.title}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: achievement.unlocked
            ? "rgba(255,255,255,0.8)"
            : isDark
              ? "#64748b"
              : "#94a3b8",
          textAlign: "center",
        }}
      >
        {achievement.description}
      </Text>

      {achievement.unlocked && (
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            padding: 2,
          }}
        >
          <CheckCircle size={16} color="#10B981" />
        </View>
      )}
    </View>
  );
};

function getDynamicAchievements({
  lessonsCount,
  quizzesCount,
  averageSatScore,
  has100Quiz,
  hasHighScore,
}: {
  lessonsCount: number;
  quizzesCount: number;
  averageSatScore: number;
  has100Quiz: boolean;
  hasHighScore: boolean;
}) {
  return [
    {
      id: 1,
      title: "First Steps",
      description: "Complete first lesson",
      icon: BookOpen,
      unlocked: lessonsCount >= 1,
      color: "cyan",
    },
    {
      id: 2,
      title: "High Scorer",
      description: "Score 700+ on SAT exam",
      icon: Trophy,
      unlocked: hasHighScore,
      color: "amber",
    },
    {
      id: 3,
      title: "Math Master",
      description: "Complete 10 quizzes",
      icon: Brain,
      unlocked: quizzesCount >= 10,
      color: "purple",
    },
    {
      id: 4,
      title: "Perfect Practice",
      description: "Score 100% on quiz",
      icon: Star,
      unlocked: has100Quiz,
      color: "green",
    },
  ];
}

export default function ProfileScreen() {
  const { token, setToken, user, setUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [contactOpen, setContactOpen] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const {
    getCompletedLessonsCount,
    getCompletedQuizzesCount,
    getAverageScoreByChapter,
    hasPerfectScoreInPublishedChapters,
    hasHighSATScore,
  } = useCourseDatabase();

  const [lessonsCount, setLessonsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [averageSatScore, setAverageSatScore] = useState(0);
  const [have100Quiz, setHave100Quiz] = useState(false);
  const [hasHighScore, setHasHighScore] = useState(false);
  const [achievements, setAchievements] = useState(
    getDynamicAchievements({
      lessonsCount: 0,
      quizzesCount: 0,
      averageSatScore: 0,
      has100Quiz: false,
      hasHighScore: false,
    })
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stats when page comes into focus
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const SAT_EXAMS_CHAPTER_ID = "8d3703a4-41ce-46b0-a27c-e25c0a0702e2";

        const lessonsRes = await getCompletedLessonsCount();
        const quizzesRes = await getCompletedQuizzesCount();
        const avgSatScoreRes = await getAverageScoreByChapter(SAT_EXAMS_CHAPTER_ID);
        const have100 = await hasPerfectScoreInPublishedChapters();
        const highScoreRes = await hasHighSATScore(SAT_EXAMS_CHAPTER_ID);

        const newLessonsCount = lessonsRes.success ? (lessonsRes.count ?? 0) : 0;
        const newQuizzesCount = quizzesRes.success ? (quizzesRes.count ?? 0) : 0;
        const newAverageScore = avgSatScoreRes.success ? (avgSatScoreRes.average ?? 0) : 0;
        const newHasHighScore = highScoreRes.success ? (highScoreRes.hasHighScore ?? false) : false;

        setLessonsCount(newLessonsCount);
        setQuizzesCount(newQuizzesCount);
        setAverageSatScore(newAverageScore);
        setHave100Quiz(have100.hasPerfectScore || false);
        setHasHighScore(newHasHighScore);

        setAchievements(
          getDynamicAchievements({
            lessonsCount: newLessonsCount,
            quizzesCount: newQuizzesCount,
            averageSatScore: newAverageScore,
            has100Quiz: have100.hasPerfectScore || false,
            hasHighScore: newHasHighScore,
          })
        );
      })();
    }, [])
  );

  // Load user data when page comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!token) {
        router.push({ pathname: "/login", params: { returnUrl: "/profile" } });
        return;
      }

      const load = async () => {
        try {
          setLoading(true);
          const res = await getUserData(token);
          if (res.success) {
            const mappedUser: UserType = {
              ...res.user,
              categories: res.user.league,
            };
            setUser(mappedUser);
          } else {
            setError(res.error || "Error loading data");
          }
        } catch {
          setError("An unexpected error occurred");
        } finally {
          setLoading(false);
        }
      };

      load();
    }, [token])
  );

  useEffect(() => {
    const loadAnswers = async () => {
      const stored = await SecureStore.getItemAsync("onboardingAnswers");
      if (stored) setAnswers(JSON.parse(stored));
      else setAnswers({ name: user?.name || "Student" });
    };
    loadAnswers();
  }, [user]);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    router.replace("/login");
    Toast.show({
      type: "success",
      text1: "You have logged out",
      position: "top",
      visibilityTime: 700,
    });
  };

  const handleRateUs = async () => {
    try {
      // First, check if in-app review is available
      const isAvailable = await StoreReview.isAvailableAsync();

      if (isAvailable) {
        // 🎯 Request in-app review (native popup)
        await StoreReview.requestReview();
        return;
      }

      // Fallback → open store page manually if in-app review not supported
      if (Platform.OS === "ios") {
        const appStoreLink = "itms-apps://itunes.apple.com/app/6751187640";
        const webLink = "https://apps.apple.com/app/id6751187640";

        Linking.openURL(appStoreLink).catch(() => Linking.openURL(webLink));
      } else if (Platform.OS === "android") {
        const playStoreLink = "market://details?id=com.hrynchuk.pdrtests";
        const webLink = "https://play.google.com/store/apps/details?id=com.hrynchuk.satprepapp";

        Linking.openURL(playStoreLink).catch(() => Linking.openURL(webLink));
      }
    } catch (error) {
      console.error("Rate app error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to open app rating",
        position: "top",
        visibilityTime: 1000,
      });
    }
  };

  if (loading) return <GraduationCap3DLoader />;
  if (error || !user)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          backgroundColor: isDark ? "#111827" : "#f9fafb",
        }}
      >
        <Text style={{ color: "#ef4444", fontSize: 16, marginBottom: 4 }}>
          Error loading profile
        </Text>
        {error && (
          <Text style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>{error}</Text>
        )}
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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f9fafb" }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={{ padding: 16 }}>
          <View
            style={{
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderRadius: 20,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {user.image ? (
                <Image
                  source={{ uri: user.image }}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    marginRight: 16,
                  }}
                />
              ) : answers["avatar"] ? (
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: "#06B6D4",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{answers["avatar"]}</Text>
                </View>
              ) : (
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: "#06B6D4",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}
                  >
                    {initials}
                  </Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: isDark ? "#ffffff" : "#1f2937",
                    marginBottom: 4,
                  }}
                >
                  {user.name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9ca3af" : "#6b7280",
                    marginBottom: 8,
                  }}
                >
                  {user.email}
                </Text>
                {user.isPro && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isDark ? "#422006" : "#fef3c7",
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 12,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Crown
                      size={14}
                      color={isDark ? "#fbbf24" : "#d97706"}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: isDark ? "#fbbf24" : "#d97706",
                      }}
                    >
                      PRO Member
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            {/* Total Points */}
            <View
              style={{
                width: "48%",
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: "#06B6D4",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: isDark ? "#0e7490" : "#cffafe",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Trophy size={20} color="#06B6D4" />
              </View>
              <AnimatedNumber value={user.points} isDark={isDark} />
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  marginTop: 4,
                }}
              >
                Total Points
              </Text>
            </View>

            {/* Lessons Done */}
            <View
              style={{
                width: "48%",
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: "#10B981",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: isDark ? "#064e3b" : "#d1fae5",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <BookOpen size={20} color="#10B981" />
              </View>
              <AnimatedNumber value={lessonsCount} isDark={isDark} />
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  marginTop: 4,
                }}
              >
                Lessons Done
              </Text>
            </View>

            {/* Quizzes Taken */}
            <View
              style={{
                width: "48%",
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: "#8B5CF6",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: isDark ? "#4c1d95" : "#ede9fe",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Target size={20} color="#8B5CF6" />
              </View>
              <AnimatedNumber value={quizzesCount} isDark={isDark} />
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  marginTop: 4,
                }}
              >
                Quizzes Taken
              </Text>
            </View>

            {/* Avg SAT Score */}
            <View
              style={{
                width: "48%",
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: "#F59E0B",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: isDark ? "#78350f" : "#fef3c7",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Star size={20} color="#F59E0B" />
              </View>
              {averageSatScore > 0 ? (
                <AnimatedNumber value={averageSatScore} isDark={isDark} />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: isDark ? "#64748b" : "#94a3b8",
                  }}
                >
                  No data
                </Text>
              )}
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  marginTop: 4,
                }}
              >
                Avg SAT Score
              </Text>
            </View>
          </View>

          {/* PRO Card */}
          {!user.isPro && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/payment")}
              style={{
                borderRadius: 20,
                overflow: "hidden",
                marginBottom: 24,
                shadowColor: "#F59E0B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={["#F59E0B", "#D97706"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 20 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Crown size={24} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#ffffff",
                      }}
                    >
                      Upgrade to PRO
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.9)",
                        marginTop: 2,
                      }}
                    >
                      Unlock all features
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: "#ffffff",
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#D97706",
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    Get Started
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Achievements */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: isDark ? "#ffffff" : "#1f2937",
              marginBottom: 16,
            }}
          >
            Achievements
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {achievements.map((ach) => (
              <AchievementBadge
                key={ach.id}
                achievement={ach}
                isDark={isDark}
              />
            ))}
          </View>

          {/* Quick Actions */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: isDark ? "#ffffff" : "#1f2937",
              marginTop: 24,
              marginBottom: 16,
            }}
          >
            Quick Actions
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/info")}
            style={{
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderRadius: 16,
              padding: 10,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: "#10B981",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: isDark ? "#334155" : "#f3f4f6",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <BookOpen size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: isDark ? "#ffffff" : "#1f2937",
                }}
              >
                About SAT
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: isDark ? "#9ca3af" : "#6b7280",
                  marginTop: 2,
                }}
              >
                Learn about the exam
              </Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              size={18}
              color={isDark ? "#64748b" : "#94a3b8"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/edit-profile")}
            style={{
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderRadius: 16,
              padding: 10,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: "#8B5CF6",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: isDark ? "#334155" : "#f3f4f6",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <User size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "500",
                color: isDark ? "#ffffff" : "#1f2937",
              }}
            >
              Edit Profile
            </Text>
            <MaterialIcons
              name="arrow-forward-ios"
              size={18}
              color={isDark ? "#64748b" : "#94a3b8"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={{
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderRadius: 16,
              padding: 10,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: "#8B5CF6",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: isDark ? "#334155" : "#f3f4f6",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Settings size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "500",
                color: isDark ? "#ffffff" : "#1f2937",
              }}
            >
              Settings
            </Text>
            <MaterialIcons
              name="arrow-forward-ios"
              size={18}
              color={isDark ? "#64748b" : "#94a3b8"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setContactOpen(true)}
            style={{
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderRadius: 16,
              padding: 10,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: "#06B6D4",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: isDark ? "#334155" : "#f3f4f6",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Mails size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "500",
                color: isDark ? "#ffffff" : "#1f2937",
              }}
            >
              Contact Us
            </Text>
            <MaterialIcons
              name="arrow-forward-ios"
              size={18}
              color={isDark ? "#64748b" : "#94a3b8"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRateUs}
            style={{
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderRadius: 16,
              padding: 10,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: "#06B6D4",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: isDark ? "#334155" : "#f3f4f6",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <ThumbsUp size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "500",
                color: isDark ? "#ffffff" : "#1f2937",
              }}
            >
              Rate Us
            </Text>
            <MaterialIcons
              name="arrow-forward-ios"
              size={18}
              color={isDark ? "#64748b" : "#94a3b8"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: isDark ? "#1e293b" : "#ffffff",
              borderRadius: 16,
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: "#ef4444",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: isDark ? "#334155" : "#f3f4f6",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <LogOut size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "500",
                color: "#ef4444",
              }}
            >
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ContactDialog
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}
