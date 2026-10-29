import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Linking,
  StyleSheet,
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
  LogIn,
  RefreshCw,
} from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { getUserData } from "@/lib/api/user";
import Toast from "react-native-toast-message";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useLogout } from "@/hooks/useLogout";
import { BlurView, BlurTargetView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { openRatePrompt } from "@/lib/ratePrompt";
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
        color: isDark ? "#F4F1F8" : "#0B0A0F",
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
    cyan: { bg: "#8A5CE6", text: "#ffffff", icon: "#ffffff" },
    purple: { bg: "#8A5CE6", text: "#ffffff", icon: "#ffffff" },
    amber: { bg: "#E5A50A", text: "#ffffff", icon: "#ffffff" },
    green: { bg: "#2E9A5E", text: "#ffffff", icon: "#ffffff" },
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
            ? "#2B2733"
            : "#E5DFEE",
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
              ? "#17151C"
              : "#D9D2E5",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <Icon
          size={24}
          color={
            achievement.unlocked ? colors.icon : isDark ? "#7E7889" : "#9C95A8"
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
              ? "#9C95A8"
              : "#6B6577",
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
              ? "#7E7889"
              : "#9C95A8",
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
          <CheckCircle size={16} color="#2E9A5E" />
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
  const { token, user, setUser, hydrated } = useAuth();
  const router = useRouter();
  const logout = useLogout();
  // Set while logging out, so the focus effect doesn't open /login a second time
  const loggingOutRef = useRef(false);
  const [reloadKey, setReloadKey] = useState(0);
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

  const handleLogout = async (message = "You have logged out") => {
    loggingOutRef.current = true;
    await logout();
    router.replace("/login");
    Toast.show({
      type: "success",
      text1: message,
      position: "top",
      visibilityTime: 700,
    });
  };

  // Load user data when page comes into focus
  useFocusEffect(
    useCallback(() => {
      // Stored token not read yet: a logged-in user would be sent to /login
      if (!hydrated) return;

      if (!token) {
        if (!loggingOutRef.current) {
          router.push({ pathname: "/login", params: { returnUrl: "/profile" } });
        }
        return;
      }
      loggingOutRef.current = false;

      const load = async () => {
        try {
          setLoading(true);
          setError(null);
          const res = await getUserData(token);
          if (res.success) {
            // The refreshed token (if any) is saved by the background sync
            const { token: _refreshedToken, ...serverUser } = res.user;
            const mappedUser: UserType = {
              ...serverUser,
              categories: serverUser.league,
            };
            setUser(mappedUser);
          } else if (res.status === 401 || res.status === 404) {
            // Token expired or account gone: log out instead of showing an error
            await handleLogout("Session expired, please log in again");
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
    }, [token, reloadKey, hydrated])
  );

  useEffect(() => {
    const loadAnswers = async () => {
      const stored = await SecureStore.getItemAsync("onboardingAnswers");
      if (stored) setAnswers(JSON.parse(stored));
      else setAnswers({ name: user?.name || "Student" });
    };
    loadAnswers();
  }, [user]);


  // Same rating sheet the app shows after a finished test (lib/ratePrompt)
  const handleRateUs = () => openRatePrompt("profile_button");

  // Logged out (or back from /login without logging in): show the page locked
  // instead of the loader, which never finishes without a token
  if (!hydrated) return <GraduationCap3DLoader />;

  if (!token) {
    return (
      <LockedProfile
        isDark={isDark}
        onLogin={() =>
          router.push({ pathname: "/login", params: { returnUrl: "/profile" } })
        }
      />
    );
  }

  if (loading) return <GraduationCap3DLoader />;
  if (error || !user)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9",
        }}
      >
        <Text style={{ color: "#D93F55", fontSize: 16, marginBottom: 4 }}>
          Error loading profile
        </Text>
        {error && (
          <Text style={{ color: isDark ? "#9C95A8" : "#6B6577" }}>{error}</Text>
        )}

        {/* Without these the user was stuck here with no way out */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
          <TouchableOpacity
            onPress={() => setReloadKey((k) => k + 1)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: "#8A5CE6",
            }}
            activeOpacity={0.7}
          >
            <RefreshCw size={16} color="#ffffff" />
            <Text style={{ color: "#ffffff", fontWeight: "600", marginLeft: 6 }}>
              Try again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleLogout()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: isDark ? "#2B2733" : "#E5DFEE",
            }}
            activeOpacity={0.7}
          >
            <LogOut size={16} color="#D93F55" />
            <Text style={{ color: "#D93F55", fontWeight: "600", marginLeft: 6 }}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
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
      style={{ flex: 1, backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9" }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={{ padding: 16 }}>
          <View
            style={{
              backgroundColor: isDark ? "#17151C" : "#ffffff",
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
                    backgroundColor: "#8A5CE6",
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
                    backgroundColor: "#8A5CE6",
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
                    color: isDark ? "#F4F1F8" : "#0B0A0F",
                    marginBottom: 4,
                  }}
                >
                  {user.name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? "#9C95A8" : "#6B6577",
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
                      color={isDark ? "#F2C94C" : "#d97706"}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "600",
                        color: isDark ? "#F2C94C" : "#d97706",
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
                backgroundColor: isDark ? "#17151C" : "#ffffff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: "#8A5CE6",
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
                  backgroundColor: isDark ? "#C9AAFB" : "#E4CDFF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Trophy size={20} color="#8A5CE6" />
              </View>
              <AnimatedNumber value={user.points} isDark={isDark} />
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9C95A8" : "#6B6577",
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
                backgroundColor: isDark ? "#17151C" : "#ffffff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: "#2E9A5E",
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
                <BookOpen size={20} color="#2E9A5E" />
              </View>
              <AnimatedNumber value={lessonsCount} isDark={isDark} />
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9C95A8" : "#6B6577",
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
                backgroundColor: isDark ? "#17151C" : "#ffffff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: "#8A5CE6",
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
                <Target size={20} color="#8A5CE6" />
              </View>
              <AnimatedNumber value={quizzesCount} isDark={isDark} />
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9C95A8" : "#6B6577",
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
                backgroundColor: isDark ? "#17151C" : "#ffffff",
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderLeftWidth: 4,
                borderLeftColor: "#E5A50A",
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
                <Star size={20} color="#E5A50A" />
              </View>
              {averageSatScore > 0 ? (
                <AnimatedNumber value={averageSatScore} isDark={isDark} />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: isDark ? "#7E7889" : "#9C95A8",
                  }}
                >
                  No data
                </Text>
              )}
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#9C95A8" : "#6B6577",
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
                shadowColor: "#E5A50A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={["#E5A50A", "#D97706"]}
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
              color: isDark ? "#F4F1F8" : "#0B0A0F",
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
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              marginTop: 24,
              marginBottom: 16,
            }}
          >
            Quick Actions
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/info")}
            style={{
              backgroundColor: isDark ? "#17151C" : "#ffffff",
              borderRadius: 16,
              padding: 10,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: "#2E9A5E",
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
                backgroundColor: isDark ? "#2B2733" : "#EFEAF7",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <BookOpen size={20} color={isDark ? "#9C95A8" : "#6B6577"} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: isDark ? "#F4F1F8" : "#0B0A0F",
                }}
              >
                About SAT
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: isDark ? "#9C95A8" : "#6B6577",
                  marginTop: 2,
                }}
              >
                Learn about the exam
              </Text>
            </View>
            <MaterialIcons
              name="arrow-forward-ios"
              size={18}
              color={isDark ? "#7E7889" : "#9C95A8"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/edit-profile")}
            style={{
              backgroundColor: isDark ? "#17151C" : "#ffffff",
              borderRadius: 16,
              padding: 10,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: "#8A5CE6",
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
                backgroundColor: isDark ? "#2B2733" : "#EFEAF7",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <User size={20} color={isDark ? "#9C95A8" : "#6B6577"} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "500",
                color: isDark ? "#F4F1F8" : "#0B0A0F",
              }}
            >
              Edit Profile
            </Text>
            <MaterialIcons
              name="arrow-forward-ios"
              size={18}
              color={isDark ? "#7E7889" : "#9C95A8"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={{
              backgroundColor: isDark ? "#17151C" : "#ffffff",
              borderRadius: 16,
              padding: 10,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: "#8A5CE6",
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
                backgroundColor: isDark ? "#2B2733" : "#EFEAF7",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Settings size={20} color={isDark ? "#9C95A8" : "#6B6577"} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "500",
                color: isDark ? "#F4F1F8" : "#0B0A0F",
              }}
            >
              Settings
            </Text>
            <MaterialIcons
              name="arrow-forward-ios"
              size={18}
              color={isDark ? "#7E7889" : "#9C95A8"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setContactOpen(true)}
            style={{
              backgroundColor: isDark ? "#17151C" : "#ffffff",
              borderRadius: 16,
              padding: 10,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: "#8A5CE6",
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
                backgroundColor: isDark ? "#2B2733" : "#EFEAF7",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Mails size={20} color={isDark ? "#9C95A8" : "#6B6577"} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "500",
                color: isDark ? "#F4F1F8" : "#0B0A0F",
              }}
            >
              Contact Us
            </Text>
            <MaterialIcons
              name="arrow-forward-ios"
              size={18}
              color={isDark ? "#7E7889" : "#9C95A8"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRateUs}
            style={{
              backgroundColor: isDark ? "#17151C" : "#ffffff",
              borderRadius: 16,
              padding: 10,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: "#8A5CE6",
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
                backgroundColor: isDark ? "#2B2733" : "#EFEAF7",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <ThumbsUp size={20} color={isDark ? "#9C95A8" : "#6B6577"} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "500",
                color: isDark ? "#F4F1F8" : "#0B0A0F",
              }}
            >
              Rate Us
            </Text>
            <MaterialIcons
              name="arrow-forward-ios"
              size={18}
              color={isDark ? "#7E7889" : "#9C95A8"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleLogout()}
            style={{
              backgroundColor: isDark ? "#17151C" : "#ffffff",
              borderRadius: 16,
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: "#D93F55",
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
                backgroundColor: isDark ? "#2B2733" : "#EFEAF7",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <LogOut size={20} color={isDark ? "#9C95A8" : "#6B6577"} />
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: "500",
                color: "#D93F55",
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


// Blurred preview of the profile page with a login card on top
function LockedProfile({ isDark, onLogin }: { isDark: boolean; onLogin: () => void }) {
  const blurTargetRef = useRef<View>(null);
  const cardBg = isDark ? "#17151C" : "#ffffff";
  const placeholderBar = isDark ? "#2B2733" : "#E5DFEE";

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9", overflow: "hidden" }}>
      {/* Placeholder copy of the real page, only for the background */}
      <BlurTargetView ref={blurTargetRef} pointerEvents="none" style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 16, paddingTop: 64 }}>
          <View style={{ backgroundColor: cardBg, borderRadius: 20, padding: 20, flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "#8A5CE6",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
              }}
            >
              <User size={32} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: isDark ? "#F4F1F8" : "#0B0A0F", marginBottom: 8 }}>
                Your profile
              </Text>
              <View style={{ height: 12, width: "60%", borderRadius: 6, backgroundColor: placeholderBar }} />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            {[0, 1].map((i) => (
              <View key={i} style={{ flex: 1, height: 90, borderRadius: 16, backgroundColor: cardBg }} />
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            {[0, 1].map((i) => (
              <View key={i} style={{ flex: 1, height: 90, borderRadius: 16, backgroundColor: cardBg }} />
            ))}
          </View>

          {[Settings, Mails, Star].map((Icon, i) => (
            <View
              key={i}
              style={{ flexDirection: "row", alignItems: "center", backgroundColor: cardBg, borderRadius: 16, padding: 16, marginTop: 12 }}
            >
              <Icon size={20} color={isDark ? "#9C95A8" : "#6B6577"} />
              <View style={{ marginLeft: 12, height: 12, width: "50%", borderRadius: 6, backgroundColor: placeholderBar }} />
            </View>
          ))}
        </View>
      </BlurTargetView>

      <BlurView
        blurTarget={blurTargetRef}
        intensity={40}
        tint={isDark ? "dark" : "light"}
        blurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      />

      <View style={[StyleSheet.absoluteFill, { justifyContent: "center", alignItems: "center", paddingHorizontal: 16 }]}>
        <View
          style={{
            backgroundColor: cardBg,
            borderRadius: 20,
            padding: 28,
            width: "100%",
            maxWidth: 420,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold", color: isDark ? "#F4F1F8" : "#0B0A0F", textAlign: "center", marginBottom: 12 }}>
            👋 Log in to see your profile
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? "#9C95A8" : "#6B6577", textAlign: "center", marginBottom: 24 }}>
            Track your progress, achievements and sync them across devices.
          </Text>

          <TouchableOpacity
            onPress={onLogin}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: "#8A5CE6",
            }}
            activeOpacity={0.8}
          >
            <LogIn size={20} color="#ffffff" />
            <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 16, marginLeft: 10 }}>
              Log in / Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
