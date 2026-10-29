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

  // Always call the hook (null source = no video) so the hook count doesn't change between lessons
  const player = useVideoPlayer(currentItem?.videoUrl ?? null, (player) => {
    player.loop = false;
  });

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
    <View style={{ flex: 1, backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9" }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 10,
          paddingHorizontal: 16,
          backgroundColor: isDark ? "#0B0A0F" : "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#17151C" : "#E5DFEE",
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
            backgroundColor: isDark ? "#17151C" : "#EFEAF7",
            borderRadius: 12,
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={isDark ? "#C9AAFB" : "#7A4BDB"} />
          <Text
            style={{
              color: isDark ? "#C9AAFB" : "#7A4BDB",
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
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 12, paddingHorizontal: 4 }}
        enableOnAndroid
        extraScrollHeight={0}
        keyboardOpeningTime={0}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width - 8)}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson Title */}
       
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              marginBottom: 8,
              paddingHorizontal: 8
            }}
          >
            {currentItem?.title}
          </Text>

        {/* Video */}
        {currentItem?.videoUrl && (
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
              fullscreenOptions={{ enable: true }}
              allowsPictureInPicture
            />
          </View>
        )}

        {/* Content WebView */}
        <View
          style={{
            borderRadius: 16,
            marginBottom: 16,
            
            minHeight: 200,
            overflow:"hidden"
          }}
        >
          {loading && (
            <View
              style={{
                position: "absolute",
                width: "100%",
                inset: 0,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: isDark ? "#0B0A0F" : "#ffffff",
                zIndex: 10,
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
              ? `html, body { margin:0; background-color: #111827; color: #f5f5f4;} .expo-content {background-color: #111827; color: #f5f5f4; padding: 8px } .expo-content blockquote {
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
            backgroundColor: isDark ? "#17151C" : "#ffffff",
            borderRadius: 16,
            padding: 12,
            marginBottom: insets.bottom + 100,
            borderLeftWidth: 4,
            borderLeftColor: "#8A5CE6",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, padding:6 }}>
            <MessageCircle size={24} color="#8A5CE6" style={{ marginRight: 8 }} />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: isDark ? "#F4F1F8" : "#0B0A0F",
              }}
            >
              Discussion
            </Text>
          </View>

          {/* Loading / Empty / Comments */}
          {loadingComments ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <ActivityIndicator size="small" color="#8A5CE6" />
            </View>
          ) : comments.length === 0 ? (
            <View
              style={{
                paddingVertical: 20,
                paddingHorizontal: 16,
                backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#2B2733" : "#E5DFEE",
                borderStyle: "dashed",
              }}
            >
              <Text
                style={{
                  color: isDark ? "#9C95A8" : "#6B6577",
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
                  backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9",
                  padding: 12,
                  borderWidth: 1,
                  borderColor: isDark ? "#2B2733" : "#E5DFEE",
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
                          borderColor: "#8A5CE6",
                        }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          marginRight: 10,
                          backgroundColor: "#8A5CE6",
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
                        color: isDark ? "#F4F1F8" : "#0B0A0F",
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
                      backgroundColor: isDark ? "#17151C" : "#ffffff",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#8A5CE6",
                    }}
                  >
                    <Text style={{ color: "#8A5CE6", fontWeight: "600", fontSize: 13 }}>
                      Reply
                    </Text>
                  </Pressable>
                </View>

                {/* Bottom: Comment Content */}
                <Text
                  style={{
                    color: isDark ? "#9C95A8" : "#2E2A35",
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
                      backgroundColor: isDark ? "#17151C" : "#ffffff",
                      padding: 12,
                      borderRadius: 12,
                      borderLeftWidth: 2,
                      borderLeftColor: "#8A5CE6",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        color: isDark ? "#F4F1F8" : "#0B0A0F",
                        marginBottom: 4,
                        fontSize: 13,
                      }}
                    >
                      {reply.author?.name || "Anonymous"}
                    </Text>
                    <Text
                      style={{
                        color: isDark ? "#9C95A8" : "#4F4A5A",
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
                    backgroundColor: isDark ? "#0B0A0F" : "#f0f9ff",
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: isDark ? "#C9AAFB" : "#7A4BDB", fontSize: 13 }}>
                    Replying to comment
                  </Text>
                  <Pressable onPress={() => setReplyTo(null)}>
                    <Text style={{ color: "#D93F55", fontWeight: "600", fontSize: 13 }}>
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
                  borderColor: isDark ? "#2B2733" : "#D9D2E5",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  color: isDark ? "#F4F1F8" : "#0B0A0F",
                  backgroundColor: isDark ? "#0B0A0F" : "#ffffff",
                  marginBottom: 10,
                  fontSize: 14,
                }}
                placeholder="Write a comment..."
                placeholderTextColor={isDark ? "#7E7889" : "#9C95A8"}
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
                  backgroundColor: submitting || !newComment.trim() ? (isDark ? "#2B2733" : "#D9D2E5") : "#8A5CE6",
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
                backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#2B2733" : "#E5DFEE",
                marginTop: 16,
              }}
            >
              <Text
                style={{
                  color: isDark ? "#9C95A8" : "#6B6577",
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
            backgroundColor: isDark ? "#0B0A0F" : "#ffffff",
            borderTopWidth: 1,
            borderTopColor: isDark ? "#17151C" : "#E5DFEE",
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
              backgroundColor: marking ? (isDark ? "#2B2733" : "#D9D2E5") : "#8A5CE6",
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#8A5CE6",
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
