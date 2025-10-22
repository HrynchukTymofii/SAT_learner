import React, { useEffect, useState } from "react"
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { Button } from "@/~/components/ui/button"
import { ArrowLeft, XCircle,  RotateCcw, BookOpen } from "lucide-react-native"
import { useAuth } from "@/context/AuthContext"
import { fetchWrongQuizzes } from "@/lib/api/quiz"
import { BlurView } from "expo-blur"
import TopBlur from "@/components/ui/TobBlur"
import BottomBlur from "@/components/ui/BottomBlur"
import { SafeAreaView } from "react-native-safe-area-context"
import { useQuizDatabase } from "@/lib/db/quiz"
import GraduationCap3DLoader from "@/components/ui/GraduationCapLoader"
import { useColorScheme } from "nativewind"
import { LinearGradient } from "expo-linear-gradient"

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

  const [quizzes, setQuizzes] = useState<WrongQuiz[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    if (!token) {
      router.push("/login")
      return
    }

    const loadQuizzes = async () => {
      setLoading(true)
      //const res = await fetchWrongQuizzes(token)
      const res = await fetchWrongQuizzesLocal()
      if (res.success) {
        setQuizzes(res.quizzes)
      } else {
        console.warn("Failed to load wrong quizzes:", res.error)
      }
      setLoading(false)
    }

    loadQuizzes()
  }, [token])

  const bgColor = isDark ? "#0c0c0e" : "#ffffff";
  const textColor = isDark ? "#f3f4f6" : "#0f172a";
  const subTextColor = isDark ? "#9ca3af" : "#475569";
  const inputBg = isDark ? "#1e293b" : "#f8fafc";
  const inputBorder = isDark ? "#334155" : "#e2e8f0";

  const getCardGradient = (): [string, string] =>
    isDark ? ["#27272a", "#18181b"] : ["#f9fafb", "#f1f5f9"];

  const handleQuizClick = (quizId: string) => {
    router.push(`/tests/wrong/${quizId}` as any)
  }

  const handleBackToTests = () => {
    router.push("/tests" as any)
  }

  const handleTakeAllWrong = () => {
    router.push("/tests/wrong/all" as any)
  }

  const filteredQuizzes = quizzes.filter((quiz) =>
    searchTerm.length === 0
      ? true
      : quiz.questions.some((q) => q.question.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalWrong = quizzes.reduce((sum, quiz) => sum + quiz.wrongCount, 0)

  if (loading) {
    return (
      <GraduationCap3DLoader />
    );
  }


  const renderQuizItem = ({ item }: { item: WrongQuiz }) => (
    // <TouchableOpacity
    //   onPress={() => handleQuizClick(item.id)}
    //   className="bg-red-50 dark:bg-stone-800 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-2 gap-2"
    //   activeOpacity={0.8}
    // >
    //   <View className="flex flex-row justify-between items-center">
    //     <Text className="text-gray-800 dark:text-gray-100 font-semibold text-sm flex-1 truncate mr-2">
    //       {item.title}
    //     </Text>
    //     <XCircle color="#b91c1c" size={20} />
    //   </View>

    //   <View className="flex flex-row justify-end items-center mt-1">
    //     <Text className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md px-2 py-0.5 text-xs">
    //       {item.wrongCount} неправильно
    //     </Text>
    //   </View>
    // </TouchableOpacity>
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
            {item.wrongCount} incorrect answers
          </Text>
        </View>
        <XCircle size={22} color={isDark ? "#f87171" : "#dc2626"} />
      </LinearGradient>
    </TouchableOpacity>
  )

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
  shadowColor: "#60a5fa",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4, // Android shadow
  marginBottom: 16,
  marginRight: "auto",
}}

        //className="rounded-2xl overflow-hidden shadow-md shadow-blue-400/30 mb-4 mr-auto"
      >
        <Button
          onPress={() => router.push("/tests")}
          className="flex-row items-center bg-transparent px-3 py-2"
        >
          <ArrowLeft size={18} color="#fff" />
          <Text className="text-white font-semibold ml-2">
            Back to modes
          </Text>
        </Button>
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
          Wrong Answers
        </Text>
        <Text
          style={{
            color: subTextColor,
            fontSize: 15,
          }}
        >
          Questions you answered incorrectly
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

      {/* Take all wrong */}
      {totalWrong > 0 && (
        <TouchableOpacity
          onPress={handleTakeAllWrong}
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
            colors={["#ef4444", "#b91c1c"]}
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
              Retake all wrong questions ({totalWrong})
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
          <BookOpen size={48} color={subTextColor} />
          <Text
            style={{
              marginTop: 12,
              fontSize: 17,
              fontWeight: "600",
              color: subTextColor,
            }}
          >
            {searchTerm ? "No quizzes found" : "No wrong answers yet"}
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
              : "Nice work! You haven’t answered any questions incorrectly yet."}
          </Text>
        </View>
      )}
    </SafeAreaView>
  )
}
