import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, MessageCircle, Send } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AutoHeightWebView from "react-native-autoheight-webview";
import { useVideoPlayer, VideoView } from "expo-video";
import Toast from "react-native-toast-message";
import { useAuth } from "@/context/AuthContext";
import {
  fetchLessonComments,
  postLessonComment,
  markLessonAsDone,
} from "@/lib/api/lesson";
import GraduationCapLoader from "@/components/ui/GraduationCapLoader";
import { useLessonDatabase } from "@/lib/db/lesson";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function LessonScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
  const [localHtml, setLocalHtml] = useState<string | null>(null);
  const { markLessonCompletedLocal, getLessonRenderedHtml } = useLessonDatabase();

  const allItems = JSON.parse(allItemsStr || "[]");
  const currentIndex = Number(currentIndexStr) || 0;
  const currentItem = allItems[currentIndex];
  const nextItem = allItems[currentIndex + 1];

  const player = currentItem?.videoUrl
    ? useVideoPlayer(currentItem?.videoUrl, (player) => {
        player.loop = false;
      })
    : null;

  // Load local HTML from database
  useEffect(() => {
    const loadLocalHtml = async () => {
      if (!currentItem?.id) return;
      const html = await getLessonRenderedHtml(currentItem.id);
      setLocalHtml(html);
      //console.log(`📄 Loaded local HTML for lesson ${currentItem.id}:`, html ? "✅ Found" : "❌ Not found");
    };
    loadLocalHtml();
  }, [currentItem?.id]);

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

  // Update theme in WebView when colorScheme changes
  useEffect(() => {
    // Send theme update message to WebView
    // This will be handled by the WebView's postMessage
  }, [isDark]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else {
      if (Platform.OS == "android") {
        router.replace("/");
      } else {
        router.push("/");
      }
    }
  };

  const handleNext = () => {
    if (!nextItem) return;
    if (Platform.OS == "android") {
      router.replace({
        pathname:
          `/course/${nextItem.chapterId}/${nextItem.type}/${nextItem.id}` as any,
        params: {
          allItems: JSON.stringify(allItems),
          currentIndex: currentIndex + 1,
        },
      });
    } else {
      router.push({
        pathname:
          `/course/${nextItem.chapterId}/${nextItem.type}/${nextItem.id}` as any,
        params: {
          allItems: JSON.stringify(allItems),
          currentIndex: currentIndex + 1,
        },
      });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#f9fafb" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 16,
          paddingHorizontal: 16,
          backgroundColor: isDark ? "#111827" : "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
        }}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBack}
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isDark ? "#1f2937" : "#f3f4f6",
            borderRadius: 12,
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={isDark ? "#06B6D4" : "#0891B2"} />
          <Text
            style={{
              color: isDark ? "#06B6D4" : "#0891B2",
              fontWeight: "600",
              marginLeft: 6,
              fontSize: 14,
            }}
          >
            Back to Course
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 16, paddingHorizontal: 4 }}
        enableOnAndroid
        extraScrollHeight={0}
        keyboardOpeningTime={0}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width - 8)}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson Title */}
        <View
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            padding: 20,
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
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: isDark ? "#ffffff" : "#1f2937",
              marginBottom: 8,
            }}
          >
            {currentItem?.title}
          </Text>
        </View>

        {/* Video */}
        {player && (
          <View
            style={{
              marginBottom: 16,
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <VideoView
              style={styles.video}
              player={player}
              allowsFullscreen
              allowsPictureInPicture
            />
          </View>
        )}

        {/* Content WebView */}
        <View
          style={{
            borderRadius: 16,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
            minHeight: 200,
            overflow:"hidden"
          }}
        >
          {loading && (
            <View
              style={{
                position: "absolute",
                inset: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                zIndex: 10,
                borderRadius: 16,
              }}
            >
              <GraduationCapLoader />
            </View>
          )}
          <AutoHeightWebView
            source={
              // localHtml
              //   ? // Use local pre-rendered HTML
              //     { html: localHtml }
              //   : // Fallback to online URL
                  {
                    uri: `https://www.satlearner.com/expo-course/${currentItem?.chapterId}/lessons/${currentItem?.id}`,
                  }
            }
            viewportContent="width=device-width, user-scalable=no"
            scalesPageToFit={true}
            style={{ width: containerWidth || "100%", padding: 8 }}
            scrollEnabled={false}
            customStyle={
            isDark
              ? `html, body { margin:0; background-color: #1e293b; color: #f5f5f4;} .expo-content {background-color: #1e293b; color: #f5f5f4; padding: 8px } .expo-content blockquote {
        --blockquote-bg-color: #b7c1cf !important;
      }`
              : ""
          }
            // customScript={
            //   // Send theme to WebView when it loads
            //   isDark
            //     ? `window.postMessage(JSON.stringify({type: 'setTheme', theme: 'dark'}));`
            //     : `window.postMessage(JSON.stringify({type: 'setTheme', theme: 'light'}));`
            // }
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
        </View>

        {/* Discussion Section */}
        <View
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: 16,
            padding: 12,
            marginBottom: insets.bottom + 100,
            borderLeftWidth: 4,
            borderLeftColor: "#8B5CF6",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, padding:6 }}>
            <MessageCircle size={24} color="#8B5CF6" style={{ marginRight: 8 }} />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: isDark ? "#ffffff" : "#1f2937",
              }}
            >
              Discussion
            </Text>
          </View>

          {/* Loading / Empty / Comments */}
          {loadingComments ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <ActivityIndicator size="small" color="#06B6D4" />
            </View>
          ) : comments.length === 0 ? (
            <View
              style={{
                paddingVertical: 20,
                paddingHorizontal: 16,
                backgroundColor: isDark ? "#0f172a" : "#f9fafb",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#e5e7eb",
                borderStyle: "dashed",
              }}
            >
              <Text
                style={{
                  color: isDark ? "#9ca3af" : "#6b7280",
                  textAlign: "center",
                  fontSize: 14,
                }}
              >
                No comments yet. Be the first to share your thoughts!
              </Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View
                key={comment.id}
                style={{
                  marginBottom: 16,
                  borderRadius: 12,
                  backgroundColor: isDark ? "#0f172a" : "#f9fafb",
                  padding: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#e5e7eb",
                }}
              >
                {/* Top Row: Avatar, Name, Reply Button */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  {/* Left: Avatar and Name */}
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                    {/* Avatar */}
                    {comment.author?.image ? (
                      <Image
                        source={{ uri: comment.author?.image }}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          marginRight: 10,
                          borderWidth: 2,
                          borderColor: "#06B6D4",
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          marginRight: 10,
                          backgroundColor: "#06B6D4",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                          {comment.author?.name?.charAt(0).toUpperCase() || "S"}
                        </Text>
                      </View>
                    )}

                    {/* Name */}
                    <Text
                      style={{
                        fontWeight: "600",
                        color: isDark ? "#ffffff" : "#1f2937",
                        fontSize: 14,
                      }}
                    >
                      {comment.author?.name || "Student"}
                    </Text>
                  </View>

                  {/* Right: Reply Button */}
                  <Pressable
                    onPress={() => setReplyTo(comment.id)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      backgroundColor: isDark ? "#1e293b" : "#ffffff",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#06B6D4",
                    }}
                  >
                    <Text style={{ color: "#06B6D4", fontWeight: "600", fontSize: 13 }}>
                      Reply
                    </Text>
                  </Pressable>
                </View>

                {/* Bottom: Comment Content */}
                <Text
                  style={{
                    color: isDark ? "#9ca3af" : "#374151",
                    lineHeight: 20,
                    fontSize: 14,
                  }}
                >
                  {comment.content}
                </Text>

                {/* Replies */}
                {comment.replies?.map((reply: any) => (
                  <View
                    key={reply.id}
                    style={{
                      marginLeft: 46,
                      marginTop: 12,
                      backgroundColor: isDark ? "#1e293b" : "#ffffff",
                      padding: 12,
                      borderRadius: 12,
                      borderLeftWidth: 2,
                      borderLeftColor: "#06B6D4",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        color: isDark ? "#ffffff" : "#1f2937",
                        marginBottom: 4,
                        fontSize: 13,
                      }}
                    >
                      {reply.author?.name || "Anonymous"}
                    </Text>
                    <Text
                      style={{
                        color: isDark ? "#9ca3af" : "#4b5563",
                        fontSize: 13,
                        lineHeight: 18,
                      }}
                    >
                      {reply.content}
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}

          {/* Comment Form */}
          {token ? (
            <View style={{ marginTop: 16 }}>
              {replyTo && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: isDark ? "#0f172a" : "#f0f9ff",
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: isDark ? "#06B6D4" : "#0891B2", fontSize: 13 }}>
                    Replying to comment
                  </Text>
                  <Pressable onPress={() => setReplyTo(null)}>
                    <Text style={{ color: "#ef4444", fontWeight: "600", fontSize: 13 }}>
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              )}

              <TextInput
                style={{
                  width: "100%",
                  minHeight: 44,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#334155" : "#d1d5db",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  color: isDark ? "#ffffff" : "#1f2937",
                  backgroundColor: isDark ? "#0f172a" : "#ffffff",
                  marginBottom: 10,
                  fontSize: 14,
                }}
                placeholder="Write a comment..."
                placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                value={newComment}
                onChangeText={setNewComment}
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
                activeOpacity={0.8}
                disabled={submitting || !newComment.trim()}
                style={{
                  backgroundColor: submitting || !newComment.trim() ? (isDark ? "#334155" : "#d1d5db") : "#06B6D4",
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Send size={16} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: 15,
                      }}
                    >
                      Post Comment
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                paddingVertical: 16,
                paddingHorizontal: 16,
                backgroundColor: isDark ? "#0f172a" : "#f9fafb",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#e5e7eb",
                marginTop: 16,
              }}
            >
              <Text
                style={{
                  color: isDark ? "#9ca3af" : "#6b7280",
                  textAlign: "center",
                  fontSize: 14,
                }}
              >
                Log in to leave a comment
              </Text>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

      {/* Next Button */}
      {nextItem && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            paddingBottom: insets.bottom + 16,
            backgroundColor: isDark ? "#111827" : "#ffffff",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#1f2937" : "#e5e7eb",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
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
                const resLocal = await markLessonCompletedLocal(
                  currentItem?.id
                );
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
            activeOpacity={0.8}
            disabled={marking}
            style={{
              backgroundColor: marking ? (isDark ? "#334155" : "#d1d5db") : "#06B6D4",
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#06B6D4",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            {marking ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: 16,
                    marginRight: 8,
                  }}
                >
                  Continue to {nextItem.type === "quiz" ? "Quiz" : "Next Lesson"}
                </Text>
                <ArrowRight size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    backgroundColor: "black",
    alignSelf: "center",
  },
});
