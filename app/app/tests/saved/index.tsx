import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View, ScrollView } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { ArrowLeft, Heart, RotateCcw, Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuizDatabase } from "@/lib/db/quiz";
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";
import { useColorScheme } from "@/hooks/useColorScheme";

export interface SavedQuiz {
  id: string;
  title: string;
  chapterTitle: string;
  savedCount: number;
  questions: any[];
}


export default function SavedQuizzesScreen() {
    const router = useRouter()
    const { token } = useAuth();
    const { fetchSavedQuizzesLocal } = useQuizDatabase();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const insets = useSafeAreaInsets();

    const [quizzes, setQuizzes] = useState<SavedQuiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login")
      return
    }

    async function loadQuizzes() {
      setLoading(true);
      const res = await fetchSavedQuizzesLocal();
      if (res.success) {
        setQuizzes(res.quizzes ?? []);
      } else {
        console.warn("Failed to load saved quizzes:", res.error);
      }
      setLoading(false);
    }

    loadQuizzes();
  }, [token]);

  if (loading) {
    return <GraduationCap3DLoader />;
  }

  const handleQuizClick = (quizId: string) => {
    router.push(`/tests/saved/${quizId}` as any);
  };

  const handleTakeAllSaved = () => {
    router.push("/tests/saved/all" as any);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    if (!searchTerm) return true;
    return quiz.questions.some((question) =>
      question.question.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalSavedQuestions = quizzes.reduce(
    (sum, quiz) => sum + quiz.savedCount,
    0
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f9fafb" }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 12,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: isDark ? "#111827" : "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
      }}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
            borderRadius: 12,
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={isDark ? "#06B6D4" : "#0891B2"} />
          <Text style={{ color: isDark ? "#06B6D4" : "#0891B2", fontWeight: "600", marginLeft: 6, fontSize: 14 }}>
            Back
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={{ fontSize: 24, fontWeight: "bold", color: isDark ? "#ffffff" : "#1f2937", marginBottom: 8 }}>
          Saved Questions
        </Text>
        <Text style={{ fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280" }}>
          Your saved questions for quick review
        </Text>

        {/* Search Bar */}
        {/* <View style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 6,
        }}>
          <Search size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: isDark ? "#ffffff" : "#1f2937",
            }}
            placeholder="Search questions..."
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={clearSearch}
              style={{ marginLeft: 8 }}
            >
              <X size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
            </TouchableOpacity>
          )}
        </View> */}
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Take all saved button */}
        {totalSavedQuestions > 0 && (
          <TouchableOpacity
            onPress={handleTakeAllSaved}
            activeOpacity={0.7}
            style={{
              marginBottom: 20,
              backgroundColor: "#10B981",
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <RotateCcw size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 16 }}>
              Practice All ({totalSavedQuestions} questions)
            </Text>
          </TouchableOpacity>
        )}

        {/* Quiz List */}
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <TouchableOpacity
              key={quiz.id}
              onPress={() => handleQuizClick(quiz.id)}
              activeOpacity={0.7}
              style={{
                marginBottom: 16,
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderRadius: 16,
                padding: 16,
                borderLeftWidth: 4,
                borderLeftColor: "#EC4899",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Title and Icon */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                  <Heart size={24} color="#EC4899" fill="#EC4899" style={{ marginRight: 12 }} />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: isDark ? "#ffffff" : "#1f2937",
                      flex: 1,
                    }}
                    numberOfLines={2}
                  >
                    {quiz.title}
                  </Text>
                </View>
              </View>

              {/* Stats */}
              <Text style={{ fontSize: 14, color: isDark ? "#94a3b8" : "#6b7280", marginLeft: 36 }}>
                {quiz.savedCount} saved question{quiz.savedCount > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center", marginTop: 48 }}>
            <Heart size={40} color={isDark ? "#9ca3af" : "#6b7280"} />
            <Text style={{ fontSize: 16, color: isDark ? "#9ca3af" : "#6b7280", marginTop: 8, textAlign: "center" }}>
              {searchTerm ? `No questions found matching "${searchTerm}"` : "No saved questions yet"}
            </Text>
            {!searchTerm && (
              <Text style={{ fontSize: 14, color: isDark ? "#6b7280" : "#9ca3af", marginTop: 4, textAlign: "center", paddingHorizontal: 32 }}>
                Save questions while taking tests for quick access later
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}