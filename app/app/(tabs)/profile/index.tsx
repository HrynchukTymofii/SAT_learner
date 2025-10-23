import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
} from "react-native";
import { useAuth, UserType } from "@/context/AuthContext";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import {
  BookOpen,
  Brain,
  CheckCircle,
  LucideIcon,
  Mails,
  Settings,
  Star,
  Trophy,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { getUserData } from "@/lib/api/user";
import Toast from "react-native-toast-message";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";
import * as SecureStore from "expo-secure-store";
import { useCourseDatabase } from "@/lib/db/course";
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";
import { ContactDialog } from "@/components/modals/ContactDialog";


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

  return (
    <Text style={{ fontSize: 20, fontWeight: "bold" }}>{displayValue}</Text>
  );
};

export interface Achievement {
  id: number | string;
  title: string;
  description: string;
  icon: LucideIcon
  unlocked: boolean;
  color: string;
}

const AchievementBadge = ({
  achievement,
}: {
  achievement: Achievement;
}) => {
  const Icon = achievement.icon;

  // Base colors
  const bgColors: Record<string, string> = {
    blue: achievement.unlocked ? "#60A5FA" : "#E5E7EB", // lighter blue
    amber: achievement.unlocked ? "#FBBF24" : "#E5E7EB", // lighter amber
    green: achievement.unlocked ? "#34D399" : "#E5E7EB", // softer green
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
          <Icon size={24} color="white" />
        </View>
        <Text
          style={{
            fontWeight: "600",
            color: "white",
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

// Example dynamic achievements calculation
function getDynamicAchievements({
  lessonsCount,
  quizzesCount,
  averageSatScore,
  has100Quiz
}: {
  lessonsCount: number;
  quizzesCount: number;
  averageSatScore: number;
  has100Quiz: boolean
}) {
  return [
    {
      id: 1,
      title: "First Steps",
      description: "Completed First Lesson",
      icon: BookOpen,
      unlocked: lessonsCount >= 1,
      color: "blue",
    },
    {
      id: 2,
      title: "High Scorer",
      description: "Scored 700+",
      icon: Trophy,
      unlocked: averageSatScore >= 700,
      color: "amber",
    },
    {
      id: 3,
      title: "Math Master",
      description: "Aced 10 Math quizzes",
      icon: Brain,
      unlocked: quizzesCount >= 10,
      color: "purple",
    },
    {
      id: 4,
      title: "Perfect Practice",
      description: "Score 100% on any quiz",
      icon: Star,
      unlocked: quizzesCount > 0 && has100Quiz,
      color: "green",
    },
  ];
}


export default function ProfileScreen() {
  const { token, setToken, user, setUser } = useAuth();
  const router = useRouter();
  const [contactOpen, setContactOpen] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { getCompletedLessonsCount, getCompletedQuizzesCount, getAverageScoreByChapter, hasPerfectScoreInPublishedChapters } = useCourseDatabase();
  
  const [lessonsCount, setLessonsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [averageSatScore, setAverageSatScore] = useState(0);
  const [have100Quiz, setHave100Quiz] = useState(false);
  const [achievements, setAchievements] = useState(getDynamicAchievements({ lessonsCount: 0, quizzesCount: 0, averageSatScore: 0, has100Quiz: false }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const lessonsRes = await getCompletedLessonsCount();
      const quizzesRes = await getCompletedQuizzesCount();
      const avgSatScpreRes = await getAverageScoreByChapter("8d3703a4-41ce-46b0-a27c-e25c0a0702e2");
      const have100 = await hasPerfectScoreInPublishedChapters();

      const newLessonsCount = lessonsRes.success ? lessonsRes.count : 0;
      const newQuizzesCount = quizzesRes.success ? quizzesRes.count : 0;
      const newAverageScore = avgSatScpreRes.success ? avgSatScpreRes.average : 0;

      setLessonsCount(newLessonsCount!);
      setQuizzesCount(newQuizzesCount!);
      setAverageSatScore(newAverageScore!);
      setHave100Quiz(have100.hasPerfectScore || false)

      setAchievements(
        getDynamicAchievements({
          lessonsCount: newLessonsCount!,
          quizzesCount: newQuizzesCount!,
          averageSatScore: newAverageScore!,
          has100Quiz: have100.hasPerfectScore || false
        })
      );
    })();
  }, []);

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
          setError(res.error || "Error loading data");
        }
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  useEffect(() => {
    const loadAnswers = async () => {
      const stored = await SecureStore.getItemAsync("onboardingAnswers");
      if (stored) setAnswers(JSON.parse(stored));
      else setAnswers({ name: user?.name || "Student" });
    };
    loadAnswers();
  }, [user]);

  // useEffect(() => {
  //   console.log("🧠 Profile mounted");

  //   return () => {
  //     console.log("🧹 Profle unmounted");
  //   };
  // }, []);

  

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    if(Platform.OS == "android"){
      router.replace("/");
    } else {
      router.push("/");
    }
    router.dismissAll();
    Toast.show({
      type: "success",
      text1: "You have logged out",
      position: "top",
      visibilityTime: 700,
    });
  };

  if (loading)
    return (
      <GraduationCap3DLoader/>
    );
  if (error || !user)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
          backgroundColor: isDark ? "#0f172a" : "#f9fafb",
        }}
      >
        <Text style={{ color: "red", fontSize: 16, marginBottom: 4 }}>
          Error loading profile
        </Text>
        {error && (
          <Text style={{ color: isDark ? "#CBD5E1" : "#6B7280" }}>{error}</Text>
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
     <View className="flex-1">
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 80,
        backgroundColor: isDark ? "#0f172a" : "#f9fafb",
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View
        style={{
          backgroundColor: isDark ? "#1e293b" : "#fff",
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          padding: 16,
          paddingTop: Platform.OS == "ios" ? 60 : 40,
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
          <Image
            source={{ uri: user.image }}
            style={{
              width: 80,
              height: 80,
              borderRadius: 999,
              borderWidth: 2,
              borderColor: "#fff",
              marginRight: 12,
            }}
          />
        ) : (
          answers["avatar"] ? 
          <View
            className='p-4 px-5 rounded-full border-2 border-white/40 mr-3 bg-[#22d3ee]'
          >
            <Text style={{ fontSize: 36 }}>{answers["avatar"]}</Text>
          </View>
          : <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 999,
              borderWidth: 2,
              borderColor: "#fff",
              backgroundColor: "#22d3ee",
              marginRight: 12,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "bold" }}>
              {initials}
            </Text>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: isDark ? "#F1F5F9" : "#1f2937",
            }}
          >
            {user.name}
          </Text>
          <Text style={{ color: isDark ? "#CBD5E1" : "#6B7280" }}>
            {user.email}
          </Text>
          {user.isPro && (
            <Text style={{  marginTop: 6, fontWeight: "600" }} className="text-yellow-500 border border-yellow-500 mr-auto rounded-xl px-2 ">
              Pro League
            </Text>
          )}
        </View>
      </View>

      {/* Stats */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          padding: 16,
        }}
      >
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
          <AnimatedNumber value={user.points} />
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
          <AnimatedNumber value={lessonsCount} />
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
          <AnimatedNumber value={quizzesCount} />
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            Quizzes Taken
          </Text>
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
          {averageSatScore > 0 ? (
            <AnimatedNumber value={averageSatScore} />
          ) : (
            <Text className="text-black font-semibold text-lg">
              No attempts
            </Text>
          )}
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            Avg SAT Score
          </Text>
        </LinearGradient>
      </View>

      { !user.isPro && <ProCard onClick={() => router.push("/payment")}/>}

      {/* Achievements */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          marginBottom: 8,
        }}
      >
        <Trophy size={20} color="#fcc00d" />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: isDark ? "#F1F5F9" : "#1f2937",
            marginLeft: 8,
          }}
        >
          Achievements
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          paddingHorizontal: 16,
        }}
      >
        {achievements.map((ach) => (
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
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              color: isDark ? "#F1F5F9" : "#1f2937",
              marginBottom: 4,
            }}
          >
            About SAT
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#CBD5E1" : "#6B7280",
              lineHeight: 20,
            }}
          >
            Learn how the SAT works, what sections it has, and tips to improve
            your score.
          </Text>
        </View>

        {/* Arrow Icon */}
        <MaterialIcons
          name="arrow-forward-ios"
          size={20}
          color={isDark ? "#CBD5E1" : "#6B7280"}
        />
      </TouchableOpacity>

      {/* Account Settings */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 32 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: isDark ? "#F1F5F9" : "#1f2937",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          Account Settings
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/edit-profile")}
          style={{
            backgroundColor: isDark ? "#1e293b" : "#fff",
            padding: 12,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <MaterialIcons
            name="person"
            size={20}
            color={isDark ? "#CBD5E1" : "#6B7280"}
          />
          <Text
            style={{ marginLeft: 8, color: isDark ? "#F1F5F9" : "#1f2937" }}
          >
            Edit Profile
          </Text>
        </TouchableOpacity>

        

        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={{
            backgroundColor: isDark ? "#1e293b" : "#fff",
            padding: 12,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Settings
            size={20}
            color={isDark ? "#CBD5E1" : "#6B7280"}
          />
          <Text
            style={{ marginLeft: 8, color: isDark ? "#F1F5F9" : "#1f2937" }}
          >
            Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setContactOpen(true)}
          style={{
            backgroundColor: isDark ? "#1e293b" : "#fff",
            padding: 12,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Mails
            size={20}
            color={isDark ? "#CBD5E1" : "#6B7280"}
          />
          <Text
            style={{ marginLeft: 8, color: isDark ? "#F1F5F9" : "#1f2937" }}
          >
            Contact us
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={{
            backgroundColor: isDark ? "#1e293b" : "#fff",
            padding: 12,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <MaterialIcons
            name="credit-card"
            size={20}
            color={isDark ? "#CBD5E1" : "#6B7280"}
          />
          <Text
            style={{ marginLeft: 8, color: isDark ? "#F1F5F9" : "#1f2937" }}
          >
            Manage Subscription
          </Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: isDark ? "#1e293b" : "#fff",
            padding: 12,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <MaterialIcons name="logout" size={20} color="red" />
          <Text style={{ marginLeft: 8, color: "red" }}>Log Out</Text>
        </TouchableOpacity>
      </View>
      
    </ScrollView>
      <ContactDialog isOpen={contactOpen} onClose={() => setContactOpen(false)} isDark={isDark}/>
      {/* <GetPremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} /> */}
    </View>
  );
}


interface ProCardProps {
  onClick: () => void;
}

const proFeatures = [
  "Access to all SAT questions",
  "Full course unlocked",
  "Saved and wrong questions tracking",
  "Access to all SAT practice exams"
];

export const ProCard = ({ onClick }: ProCardProps) => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#facc15", "#fef08a"], // warm glowing gold
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          borderColor,
        },
      ]}
      className="m-3 rounded-2xl bg-white dark:bg-[#1e293b] shadow-lg shadow-black/20 mb-8 mt-0 "
    >
      <LinearGradient
        colors={["#facc15", "#fbbf24"]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.header}
      >
        <FontAwesome5 name="crown" size={26} color="#fff" />
        <Text className="text-white font-extrabold text-xl ml-3">
          Upgrade to PRO
        </Text>
      </LinearGradient>

      <View className="p-5">
        {proFeatures.map((feature, i) => (
          <View key={i} className="flex-row items-center mb-3">
            <FontAwesome5
              name="check"
              size={14}
              color="#16a34a"
              style={{ marginRight: 8 }}
            />
            <Text className="text-gray-700 dark:text-slate-200">{feature}</Text>
          </View>
        ))}

        <TouchableOpacity
          onPress={onClick}
          activeOpacity={0.9}
          className="mt-2 rounded-2xl overflow-hidden shadow-md shadow-yellow-500/40"
        >
          <LinearGradient
            colors={["#facc15", "#fbbf24"]}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.button}
          >
            <Text className="text-white font-semibold text-center text-base">
              Go PRO
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  button: {
    paddingVertical: 12,
    alignItems: "center",
  },
});
