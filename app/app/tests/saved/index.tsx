import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { fetchSavedQuizzes } from "@/lib/api/quiz"; 
import { useRouter } from "expo-router";
import { Button } from "@/~/components/ui/button";
import { ArrowLeft, Heart, RotateCcw } from "lucide-react-native";
import TopBlur from "@/components/ui/TobBlur";
import BottomBlur from "@/components/ui/BottomBlur";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuizDatabase } from "@/lib/db/quiz";
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

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
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

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
      //const res = await fetchSavedQuizzes(token!);
      if (res.success) {
        setQuizzes(res.quizzes ?? []);
      } else {
        console.warn("Failed to load saved quizzes:", res.error);
      }
      setLoading(false);
    }

    loadQuizzes();
  }, [token]);

  const bgColor = isDark ? "#0c0c0e" : "#ffffff";
  const textColor = isDark ? "#f3f4f6" : "#0f172a";
  const subTextColor = isDark ? "#9ca3af" : "#475569";
  const inputBg = isDark ? "#1e293b" : "#f8fafc";
  const inputBorder = isDark ? "#334155" : "#e2e8f0";

  const getCardGradient = (): [string, string] =>
    isDark ? ["#27272a", "#18181b"] : ["#f9fafb", "#f1f5f9"];

  if (loading) {
    return (
      <GraduationCap3DLoader />
    );
  }

  const handleQuizClick = (quizId: string) => {
    //console.log(`/tests/saved/${quizId}`)
    router.push(`/tests/saved/${quizId}` as any);
  };

  const handleBackToTests = () => {
    router.push("/tests" as any);
  };

  const handleTakeAllSaved = () => {
    router.push("/tests/saved/all" as any);
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

  const renderQuizItem = ({ item }: { item: SavedQuiz }) => (
    <TouchableOpacity
      onPress={() => handleQuizClick(item.id)}
      activeOpacity={0.8}
      style={{
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
      }}
    >
      <LinearGradient
        colors={getCardGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          padding: 16,
          borderRadius: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: 1,
          borderColor: isDark ? "#3f3f46" : "#e5e7eb",
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: textColor,
              marginBottom: 4,
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: subTextColor,
            }}
          >
            {item.savedCount} saved
          </Text>
        </View>
        <Heart size={22} color={isDark ? "#60a5fa" : "#2563eb"} />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: bgColor,
        paddingHorizontal: 16,
        paddingTop: 8,
      }}
    >
      {/* Header */}
      <LinearGradient
        colors={["#3b82f6", "#2563eb"]}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5,
          marginBottom: 16,
          alignSelf: "flex-start",
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/tests")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <ArrowLeft size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
            Back to modes
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Title */}
      <View style={{ marginBottom: 8 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: isDark ? "#60a5fa" : "#2563eb",
            marginBottom: 4,
          }}
        >
          Saved Questions
        </Text>
        <Text
          style={{
            color: subTextColor,
            fontSize: 15,
          }}
        >
          Your saved questions for quick review
        </Text>
      </View>

      {/* Search */}
      <TextInput
        placeholder="Search..."
        placeholderTextColor={subTextColor}
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={{
          backgroundColor: inputBg,
          borderWidth: 1,
          borderColor: inputBorder,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
          color: textColor,
          marginBottom: 16,
          fontSize: 15,
        }}
      />

      {/* Take all saved */}
      {totalSavedQuestions > 0 && (
        <TouchableOpacity
          onPress={handleTakeAllSaved}
          activeOpacity={0.9}
          style={{
            marginBottom: 20,
            borderRadius: 16,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <LinearGradient
            colors={["#22c55e", "#16a34a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              borderRadius: 16,
            }}
          >
            <RotateCcw size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              Take all saved questions ({totalSavedQuestions})
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* List */}
      {filteredQuizzes.length > 0 ? (
        <FlatList
          data={filteredQuizzes}
          renderItem={renderQuizItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 60,
          }}
        >
          <Heart size={48} color={subTextColor} />
          <Text
            style={{
              marginTop: 12,
              fontSize: 17,
              fontWeight: "600",
              color: subTextColor,
            }}
          >
            {searchTerm ? "No quizzes found" : "No saved questions yet"}
          </Text>
          <Text
            style={{
              color: subTextColor,
              textAlign: "center",
              marginTop: 4,
              paddingHorizontal: 16,
            }}
          >
            {searchTerm
              ? "No results match your search."
              : "Save questions while taking tests for quick access later."}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}