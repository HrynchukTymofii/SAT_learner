import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
  useColorScheme,
  Dimensions,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AutoHeightWebView from "react-native-autoheight-webview";
import { useVideoPlayer, VideoView } from "expo-video";
import Toast from "react-native-toast-message";

import TopBlur from "@/components/ui/TobBlur";
import { useAuth } from "@/context/AuthContext";
import {
  fetchLessonComments,
  postLessonComment,
  markLessonAsDone,
} from "@/lib/api/lesson";
import GraduationCapLoader from "@/components/ui/GraduationCapLoader";
import { LinearGradient } from "expo-linear-gradient";
import { useLessonDatabase } from "@/lib/db/lesson";

export default function LessonScreen() {
  const router = useRouter();
  const { allItems: allItemsStr, currentIndex: currentIndexStr } =
    useLocalSearchParams<{ allItems: string; currentIndex: string }>();
  const { token } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [containerWidth, setContainerWidth] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const { markLessonCompletedLocal } = useLessonDatabase()

  const allItems = JSON.parse(allItemsStr || "[]");
  const currentIndex = Number(currentIndexStr) || 0;
  const currentItem = allItems[currentIndex];
  const nextItem = allItems[currentIndex + 1];

  const player = currentItem?.videoUrl
    ? useVideoPlayer(currentItem?.videoUrl, (player) => {
        player.loop = false;
      })
    : null;

  // Load comments
  useEffect(() => {
    let isMounted = true;
    const loadComments = async () => {
      if (!currentItem?.id || !token) return;
      setLoadingComments(true);
      const res = await fetchLessonComments(currentItem.id);
      if (isMounted) {
        if (res.success) setComments(res.data);
        setLoadingComments(false);
      }
    };
    loadComments();
    return () => {
      isMounted = false;
    };
  }, [currentItem?.id, token]);

  const handleBack = () => router.replace("/");
  const handleNext = () => {
    if (!nextItem) return;
    router.push({
      pathname:
        `/course/${nextItem.chapterId}/${nextItem.type}/${nextItem.id}` as any,
      params: {
        allItems: JSON.stringify(allItems),
        currentIndex: currentIndex + 1,
      },
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}
    >
      {!isDark && <TopBlur />}

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 12,
        }}
      >
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => ({
            alignSelf: "flex-start",
            borderRadius: 10,
            overflow: "hidden",
            opacity: pressed ? 0.8 : 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          })}
        >
          <LinearGradient
            colors={isDark ? ["#1e3a8a", "#2563eb"] : ["#3b82f6", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 6,
              paddingHorizontal: 18,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
              gap: 8,
            }}
          >
            <ArrowLeft size={18} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 15,
                letterSpacing: 0.3,
              }}
            >
              Back to course
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 12 }}
        enableOnAndroid
        extraScrollHeight={220}
        keyboardOpeningTime={0}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width - 20)}
      >
        {/* Lesson Title */}
        <View style={{ marginBottom: 12 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: isDark ? "#f1f5f9" : "#1f2937",
            }}
          >
            {currentItem?.title}
          </Text>
        </View>
        {/* Video */}
        {player && (
          <View style={{ marginBottom: 12 }}>
            <VideoView
              style={styles.video}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
            />
          </View>
        )}

        {/* WebView */}
        {loading && (
          <View
            style={{
              position: "absolute",
              inset: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: isDark ? "#0f172a" : "#fff",
              zIndex: 10,
            }}
          >
            <GraduationCapLoader />
          </View>
        )}
        <AutoHeightWebView
          source={{
            uri: `https://www.satlearner.com/expo-course/${currentItem?.chapterId}/lessons/${currentItem?.id}`,
          }}
          viewportContent="width=device-width, user-scalable=no"
          scalesPageToFit={true}
          style={{ width: containerWidth || "100%" }}
          scrollEnabled={false}
          customStyle={
            isDark
              ? `html, body {
                background-color: #0f172a;
                color: #f5f5f4;
                margin: 0 !important;
              } 
              *{
                background-color: inherit;
                color: inherit;
              }`
              : ""
          }
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />

        {/* 💬 Discussion Section */}
        <View style={{ marginTop: 24 }}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: isDark ? "#f1f5f9" : "#1f2937",
              marginBottom: 12,
            }}
          >
            Discussion
          </Text>

          {/* Loading / Empty / Comments */}
          {loadingComments ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : comments.length === 0 ? (
            <Text style={{ color: isDark ? "#cbd5e1" : "#6b7280" }}>
              No comments yet. Be the first to share your thoughts!
            </Text>
          ) : (
            comments.map((comment) => (
              <View
                key={comment.id}
                style={{
                  marginBottom: 16,
                  borderRadius: 16,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <LinearGradient
                  colors={
                    isDark ? ["#1e293b", "#0f172a"] : ["#f8fafc", "#e2e8f0"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    padding: 12,
                    flexDirection: "row",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Avatar */}
                  {comment.author?.image ? (
                    <Image
                      source={{ uri: comment.author?.image }}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        marginRight: 10,
                        borderWidth: 1,
                        borderColor: isDark ? "#334155" : "#d1d5db",
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        marginRight: 10,
                        backgroundColor: "#3b82f6",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700" }}>
                        {comment.author?.name?.charAt(0).toUpperCase() || "S"}
                      </Text>
                    </View>
                  )}

                  {/* Comment Body */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: "600",
                        color: isDark ? "#f1f5f9" : "#1f2937",
                        marginBottom: 2,
                      }}
                    >
                      {comment.author?.name || "Student"}
                    </Text>
                    <Text
                      style={{
                        color: isDark ? "#cbd5e1" : "#374151",
                        lineHeight: 20,
                      }}
                    >
                      {comment.content}
                    </Text>

                    {/* Reply */}
                    <Pressable
                      onPress={() => setReplyTo(comment.id)}
                      style={{ marginTop: 4 }}
                    >
                      <Text style={{ color: "#3b82f6", fontWeight: "600" }}>
                        Reply
                      </Text>
                    </Pressable>
                  </View>
                </LinearGradient>

                {/* Replies */}
                {comment.replies?.map((reply: any) => (
                  <View
                    key={reply.id}
                    style={{
                      marginLeft: 48,
                      marginTop: 8,
                      backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
                      padding: 10,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        color: isDark ? "#f1f5f9" : "#1f2937",
                      }}
                    >
                      {reply.author?.name || "Anonymous"}
                    </Text>
                    <Text
                      style={{
                        color: isDark ? "#cbd5e1" : "#4b5563",
                        marginTop: 2,
                      }}
                    >
                      {reply.content}
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}

          {/* 📝 Comment Form */}
          {token ? (
            <View style={{ marginTop: 12 }}>
              {replyTo && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ color: isDark ? "#cbd5e1" : "#6b7280" }}>
                    Replying to comment
                  </Text>
                  <Pressable onPress={() => setReplyTo(null)}>
                    <Text style={{ color: "#ef4444", fontWeight: "600" }}>
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              )}

              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Write a comment..."
                placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
                style={{
                  width: "100%",
                  minHeight: 44,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#d1d5db",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  color: isDark ? "#f1f5f9" : "#1f2937",
                  backgroundColor: isDark ? "#1e293b" : "#fff",
                  marginBottom: 10,
                }}
                multiline
              />

              <TouchableOpacity
                onPress={async () => {

                  if (!newComment.trim()) return;
                  setSubmitting(true);
                  const res = await postLessonComment(
                    token,
                    currentItem.id,
                    newComment.trim(),
                    replyTo || undefined
                  );
                  setSubmitting(false);
                  if (res.success) {
                    setNewComment("");
                    setReplyTo(null);
                    const refreshed = await fetchLessonComments(currentItem.id);
                    if (refreshed.success) setComments(refreshed.data);
                  } else {
                    Toast.show({
                      type: "error",
                      text1: "Error",
                      text2: res.error || "Failed to post comment",
                    });
                  }
                }}
                activeOpacity={0.9}
                disabled={submitting}
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.15,
                  shadowRadius: 10,
                  elevation: 4,
                }}
              >
                <LinearGradient
                  colors={["#10b981", "#16a34a"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 14,
                  }}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: 16,
                        letterSpacing: 0.3,
                      }}
                    >
                      Send
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <Text
              style={{
                color: isDark ? "#cbd5e1" : "#6b7280",
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Log in to leave a comment
            </Text>
          )}
        </View>
      </KeyboardAwareScrollView>

      {nextItem && (
        <View style={{ padding: 12 }}>
          <TouchableOpacity
            onPress={async () => {
              if (marking) return;
              setMarking(true);

              if (!token) {
                router.push("/login");
                return;
              }

              // If not completed, mark as done first
              if (!currentItem?.completed) {
                const resLocal = await markLessonCompletedLocal(currentItem?.id)
                const res = await markLessonAsDone(token, currentItem?.id);
                if (!resLocal) {
                  Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: res.error || "Failed to mark lesson",
                  });
                  setMarking(false);
                  return;
                }
              }

              // Then navigate to next
              setMarking(false);
              handleNext();
            }}
            activeOpacity={0.9}
            style={{
              borderRadius: 14,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 4,
              opacity: marking ? 0.6 : 1,
            }}
          >
            <LinearGradient
              colors={["#3b82f6", "#2563eb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                borderRadius: 14,
                gap: 8,
              }}
            >
              {marking && <ActivityIndicator size="small" color="#fff" />}
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: 16,
                  letterSpacing: 0.3,
                }}
              >
                Go to next lesson
              </Text>
              <ArrowRight size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    backgroundColor: "black",
    alignSelf: "center",
    marginBottom: 12,
  },
});

// import { SafeAreaView } from "react-native-safe-area-context";
// import { ActivityIndicator, Pressable, ScrollView, Text, TouchableOpacity, View, useColorScheme } from "react-native";
// import { WebView } from "react-native-webview";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import TopBlur from "@/components/ui/TobBlur";
// import { ArrowLeft } from "lucide-react-native";
// import { useState } from "react";
// import ConfettiCannon from "react-native-confetti-cannon";

// export default function LessonScreen() {
//   const router = useRouter();
//   const colorScheme = useColorScheme();
//   const isDark = colorScheme === "dark";

//   const { allItems: allItemsStr, currentIndex: currentIndexStr } = useLocalSearchParams<{
//     allItems: string;
//     currentIndex: string;
//   }>();
//   const [showConfetti, setShowConfetti] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const allItems = JSON.parse(allItemsStr || "[]");
//   const currentIndex = Number(currentIndexStr) || 0;

//   const currentItem = allItems[currentIndex];
//   const nextItem = allItems[currentIndex + 1];

//   const handleNext = () => {
//     setShowConfetti(true);
//     setTimeout(() => {
//       if (nextItem) {
//         router.push({
//           pathname: `/course/${nextItem.chapterId}/${nextItem.type}/${nextItem.id}` as any,
//           params: { allItems: JSON.stringify(allItems), currentIndex: currentIndex + 1 },
//         });
//       }
//       setShowConfetti(false);
//     }, 1500);
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#0f172a" : "#f8fafc" }}>
//       <TopBlur />

//       {/* Back Button */}
//       <Pressable
//         onPress={() => router.push("/")}
//         style={{ flexDirection: "row", alignItems: "center", marginTop: 16, marginLeft: 16 }}
//       >
//         <ArrowLeft size={20} color={isDark ? "#cbd5e1" : "gray"} />
//         <Text style={{ marginLeft: 8, color: isDark ? "#cbd5e1" : "#1f2937", fontSize: 16 }}>
//           Return to course
//         </Text>
//       </Pressable>

//       <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
//         {/* Lesson Title */}
//         <View style={{ marginBottom: 12 }}>
//           <Text style={{ fontSize: 24, fontWeight: "bold", color: isDark ? "#f1f5f9" : "#1f2937" }}>
//             {currentItem?.title}
//           </Text>
//         </View>

//         {currentItem?.type === "lesson" && (
//           <View className="flex-1">
//             <WebView
//               source={{
//                 uri: `https://www.satlearner.com/expo-course/${currentItem.chapterId}/lessons/${currentItem.id}`,
//               }}
//               style={{ flex: 1 }}
//               originWhitelist={["*"]}
//               javaScriptEnabled
//               domStorageEnabled
//               onLoadStart={() => setLoading(true)}
//               onLoadEnd={() => setLoading(false)}
//             />

//             {loading && (
//               <View className="absolute inset-0 items-center justify-center bg-white">
//                 <ActivityIndicator size="large" color="#2563eb" />
//                 <Text className="mt-2">Loading...</Text>
//               </View>
//             )}

//           </View>
//         )}

//         {/* Next Lesson Button */}
//         {nextItem && (
//           <View>
//             <TouchableOpacity
//               onPress={handleNext}
//               activeOpacity={0.9}
//               style={{
//                 backgroundColor: "#2563eb",
//                 paddingVertical: 14,
//                 borderRadius: 20,
//                 alignItems: "center",
//                 justifyContent: "center",
//                 shadowColor: "#000",
//                 shadowOffset: { width: 0, height: 6 },
//                 shadowOpacity: 0.15,
//                 shadowRadius: 10,
//                 elevation: 4,
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
//                 Go to {nextItem.title}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </ScrollView>

//       {/* Confetti */}
//       {showConfetti && <ConfettiCannon count={120} origin={{ x: -10, y: 0 }} fadeOut />}
//     </SafeAreaView>
//   );
// }
