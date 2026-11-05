import { useEffect, useState } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Target,
  Trophy,
  BookOpen,
  BookCheck,
  ArrowLeft,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useQuizDatabase } from "@/lib/db/quiz";
import { TrendingUp } from "lucide-react-native";
import { TestList } from "@/components/tests/TestList";
import { Loading, PillButton } from "@/components/ds";


type Quiz = {
  id: string;
  title: string;
  questionCount: number;
  progress: number;
  completed: boolean;
  score: number;
  attemptCount: number;
  lastAttempt?: string;
};

export default function ImproveScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filtered, setFiltered] = useState<Quiz[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { fetchQuizzesByTopicLocal } = useQuizDatabase();

  const bgColor = isDark ? "#0B0A0F" : "#F4F1F9";
  const inputBg = isDark ? "#17151C" : "#ffffff";
  const inputBorder = isDark ? "#2B2733" : "#E5DFEE";
  const textColor = isDark ? "#EFEAF7" : "#0B0A0F";
  const subTextColor = isDark ? "#CFC9DA" : "#6B6577";

  useEffect(() => {
    if (!token) router.push("/login");
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const loadQuizzes = async () => {
      try {
        const res = await fetchQuizzesByTopicLocal();
        if (res.success) {
          setQuizzes(res.quizzes);
          setFiltered(res.quizzes);
        } else {
          console.warn("Failed to load quizzes:", res.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadQuizzes();
  }, []);

  useEffect(() => {
    setFiltered(
      quizzes.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, quizzes]);

  if (loading) return <Loading />;

  const getProgressGradient = (p: number): [string, string] => {
    // subtle muted gradients
    if (p >= 80)
      return isDark ? ["#6FCF97", "#2E9A5E"] : ["#2ed08b", "#0ea972"]; // green
    if (p >= 60)
      return isDark ? ["#F2C94C", "#E5A50A"] : ["#f9b81f", "#f4970b"];
    return isDark ? ["#17151C", "#273449"] : ["#EFEAF7", "#e2e8f0"];
  };

  const handlePress = (quizId: string) =>
    router.push(`/tests/improve/${quizId}` as any);

  return (
    <TestList
      title="Improve"
      subtitle="Practice built from your mistakes, one topic at a time."
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search topics"
      items={filtered.map((quiz) => ({
        id: quiz.id,
        title: quiz.title.trim(),
        subtitle: `${quiz.questionCount} questions`,
        progress: quiz.progress,
        onPress: () => handlePress(quiz.id),
      }))}
      empty={{ icon: TrendingUp, title: "Nothing to improve yet", text: "Finish a few quizzes and your practice shows up here." }}
    />
  );
}
