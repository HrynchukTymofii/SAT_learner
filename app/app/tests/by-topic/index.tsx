import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Book,
  BookCheck,
  ArrowLeft,
  Lock,
  Search,
  X,
} from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { useQuizDatabase } from "@/lib/db/quiz";
import { useColorScheme } from "@/hooks/useColorScheme";
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";
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

export default function TestsByTopicScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filtered, setFiltered] = useState<Quiz[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { fetchQuizzesByTopicLocal } = useQuizDatabase();

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
        !q.title.toLowerCase().startsWith("sat exam".toLowerCase()) &&
        !q.title.toLowerCase().startsWith("theory check".toLowerCase()) &&
        q.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, quizzes]);

  if (loading) {
    return <Loading />;
  }

  const getProgressColor = (p: number) => {
    if (p >= 90) return "#2E9A5E"; // Green
    if (p >= 70) return "#E5A50A"; // Yellow
    if (p >= 50) return "#8A5CE6"; // Purple
    if (p >= 30) return "#8A5CE6"; // Blue/Cyan
    if (p >= 10) return "#D93F55"; // Red
    return "#7E7889"; // Neutral gray
  };

  const clearSearch = () => {
    setSearch("");
  };

  const handlePress = (quizId: string, isLocked: boolean) => {
    if (isLocked) {
      router.push("/payment");
      return;
    }
    router.push(`/tests/by-topic/${quizId}` as any);
  }
    

  return (
    <TestList
      title="Practice by topic"
      subtitle="Pick a topic and drill it until it sticks."
      search={search}
      onSearch={setSearch}
      searchPlaceholder="Search topics"
      items={filtered.map((quiz, index) => {
        const isLocked = (!user?.isPro && index > 3) || false;
        return {
          id: quiz.id,
          title: quiz.title.trim(),
          subtitle: `${quiz.questionCount} questions${quiz.attemptCount > 0 ? ` · ${quiz.attemptCount} attempt${quiz.attemptCount > 1 ? "s" : ""}` : ""}`,
          progress: quiz.progress,
          locked: isLocked,
          onPress: () => handlePress(quiz.id, isLocked),
        };
      })}
      empty={{ icon: Book, title: "No topics yet", text: "Topics show up here once the course is downloaded." }}
    />
  );
}
