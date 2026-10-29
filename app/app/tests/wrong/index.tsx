import React, { useEffect, useState, useCallback } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native"
import { useRouter, useFocusEffect } from "expo-router"
import { ArrowLeft, XCircle, RotateCcw, Search, X } from "lucide-react-native"
import { useAuth } from "@/context/AuthContext"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useQuizDatabase } from "@/lib/db/quiz"
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader"
import { useColorScheme } from "@/hooks/useColorScheme"

export interface WrongQuiz {
  id: string
  title: string
  chapterTitle: string
  wrongCount: number
  questions: { question: string }[]
}

export default function WrongQuizzesScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const { fetchWrongQuizzesLocal } = useQuizDatabase();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const [quizzes, setQuizzes] = useState<WrongQuiz[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const loadQuizzes = useCallback(async () => {
    if (!token) {
      router.push("/login")
      return
    }
    setLoading(true)
    const res = await fetchWrongQuizzesLocal()
    if (res.success) {
      setQuizzes(res.quizzes)
    } else {
      console.warn("Failed to load wrong quizzes:", res.error)
    }
    setLoading(false)
  }, [token, fetchWrongQuizzesLocal, router])

  useEffect(() => {
    loadQuizzes()
  }, [])

  // Refresh wrong questions list when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadQuizzes()
    }, [])
  )

  if (loading) {
    return <GraduationCap3DLoader />;
  }

  const handleQuizClick = (quizId: string) => {
    router.push(`/tests/wrong/${quizId}` as any)
  }

  const handleTakeAllWrong = () => {
    router.push("/tests/wrong/all" as any)
  }

  const clearSearch = () => {
    setSearchTerm("");
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    searchTerm.length === 0
      ? true
      : quiz.questions.some((q) => q.question.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalWrong = quizzes.reduce((sum, quiz) => sum + quiz.wrongCount, 0)

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9" }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 12,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: isDark ? "#0B0A0F" : "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "#17151C" : "#E5DFEE",
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
            backgroundColor: isDark ? "#17151C" : "#EFEAF7",
            borderRadius: 12,
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={isDark ? "#C9AAFB" : "#7A4BDB"} />
          <Text style={{ color: isDark ? "#C9AAFB" : "#7A4BDB", fontWeight: "600", marginLeft: 6, fontSize: 14 }}>
            Back
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={{ fontSize: 24, fontWeight: "bold", color: isDark ? "#F4F1F8" : "#0B0A0F", marginBottom: 8 }}>
          Wrong Answers
        </Text>
        <Text style={{ fontSize: 14, color: isDark ? "#9C95A8" : "#6B6577"}}>
          Questions you answered incorrectly
        </Text>

        {/* Search Bar */}
        {/* <View style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: isDark ? "#17151C" : "#EFEAF7",
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 6,
        }}>
          <Search size={20} color={isDark ? "#9C95A8" : "#6B6577"} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontSize: 16,
              color: isDark ? "#F4F1F8" : "#0B0A0F",
            }}
            placeholder="Search questions..."
            placeholderTextColor={isDark ? "#7E7889" : "#9C95A8"}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={clearSearch}
              style={{ marginLeft: 8 }}
            >
              <X size={20} color={isDark ? "#9C95A8" : "#6B6577"} />
            </TouchableOpacity>
          )}
        </View> */}
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Take all wrong button */}
        {totalWrong > 0 && (
          <TouchableOpacity
            onPress={handleTakeAllWrong}
            activeOpacity={0.7}
            style={{
              marginBottom: 20,
              backgroundColor: "#D93F55",
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
              Retry All ({totalWrong} questions)
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
                backgroundColor: isDark ? "#17151C" : "#ffffff",
                borderRadius: 16,
                padding: 16,
                borderLeftWidth: 4,
                borderLeftColor: "#D93F55",
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
                  <XCircle size={24} color="#D93F55" style={{ marginRight: 12 }} />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: isDark ? "#F4F1F8" : "#0B0A0F",
                      flex: 1,
                    }}
                    numberOfLines={2}
                  >
                    {quiz.title}
                  </Text>
                </View>
              </View>

              {/* Stats */}
              <Text style={{ fontSize: 14, color: isDark ? "#9C95A8" : "#6B6577", marginLeft: 36 }}>
                {quiz.wrongCount} incorrect answer{quiz.wrongCount > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center", marginTop: 48 }}>
            <XCircle size={40} color={isDark ? "#9C95A8" : "#6B6577"} />
            <Text style={{ fontSize: 16, color: isDark ? "#9C95A8" : "#6B6577", marginTop: 8, textAlign: "center" }}>
              {searchTerm ? `No questions found matching "${searchTerm}"` : "No wrong answers yet"}
            </Text>
            {!searchTerm && (
              <Text style={{ fontSize: 14, color: isDark ? "#7E7889" : "#9C95A8", marginTop: 4, textAlign: "center", paddingHorizontal: 32 }}>
                Nice work! You haven't answered any questions incorrectly yet
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
