import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, MessageCircle, Send, X } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AutoHeightWebView from "react-native-autoheight-webview";
import { useVideoPlayer, VideoView } from "expo-video";
import Toast from "react-native-toast-message";
import { useAuth } from "@/context/AuthContext";
import { fetchLessonComments, markLessonAsDone, postLessonComment } from "@/lib/api/lesson";
import { useLessonDatabase } from "@/lib/db/lesson";
import { Fonts, usePalette } from "@/constants/palette";
import { Card, Field, GUTTER, IconTile, LinkButton, PillButton, T, Tag, TopBar } from "@/components/ds";

export default function LessonScreen() {
  const router = useRouter();
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { allItems: allItemsStr, currentIndex: currentIndexStr } = useLocalSearchParams<{ allItems: string; currentIndex: string }>();
  const { token } = useAuth();

  const [containerWidth, setContainerWidth] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const { markLessonCompletedLocal } = useLessonDatabase();

  const allItems = JSON.parse(allItemsStr || "[]");
  const currentIndex = Number(currentIndexStr) || 0;
  const currentItem = allItems[currentIndex];
  const nextItem = allItems[currentIndex + 1];

  // Always call the hook (null source = no video) so the hook count doesn't change between lessons
  const player = useVideoPlayer(currentItem?.videoUrl ?? null, (p) => {
    p.loop = false;
  });

  // Comments
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

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else if (Platform.OS == "android") router.replace("/");
    else router.push("/");
  };

  const handleNext = () => {
    if (!nextItem) return;
    const target = {
      pathname: `/course/${nextItem.chapterId}/${nextItem.type}/${nextItem.id}` as any,
      params: { allItems: JSON.stringify(allItems), currentIndex: currentIndex + 1 },
    };
    if (Platform.OS == "android") router.replace(target);
    else router.push(target);
  };

  // Marks the lesson done (locally and on the server), then runs `then`
  const finishLesson = async (then: () => void) => {
    if (marking) return;
    if (!token) {
      router.push("/login");
      return;
    }
    setMarking(true);
    if (!currentItem?.completed) {
      const resLocal = await markLessonCompletedLocal(currentItem?.id);
      const res = await markLessonAsDone(token, currentItem?.id);
      if (!resLocal) {
        Toast.show({ type: "error", text1: "Error", text2: res.error || "Failed to mark lesson" });
        setMarking(false);
        return;
      }
    }
    setMarking(false);
    then();
  };

  const postComment = async () => {
    if (!token || !newComment.trim()) return;
    setSubmitting(true);
    const res = await postLessonComment(token, currentItem.id, newComment.trim(), replyTo || undefined);
    setSubmitting(false);
    if (res.success) {
      setNewComment("");
      setReplyTo(null);
      const refreshed = await fetchLessonComments(currentItem.id);
      if (refreshed.success) setComments(refreshed.data);
    } else {
      Toast.show({ type: "error", text1: "Error", text2: res.error || "Failed to post comment" });
    }
  };

  // Lesson pages come from the website; match them to the app's background and fonts
  const webCss = `
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700&family=Outfit:wght@600&display=swap');
    html, body { margin:0; background:${c.bg}; color:${c.ink}; font-family: Manrope, system-ui, sans-serif; }
    .expo-content { background:${c.bg} !important; color:${c.ink} !important; padding: 4px 4px 8px; font-size: 16px; line-height: 1.6; }
    .expo-content h1, .expo-content h2, .expo-content h3 { font-family: Outfit, system-ui, sans-serif; letter-spacing: -0.02em; }
    ${c.isDark ? ".expo-content blockquote { --blockquote-bg-color: #221F29 !important; }" : ""}
  `;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: GUTTER, paddingBottom: 8 }}>
        <TopBar onBack={handleBack} title={allItems.length > 1 ? `Step ${currentIndex + 1} of ${allItems.length}` : undefined} />
        {allItems.length > 1 && (
          <View style={{ flexDirection: "row", gap: 3, marginTop: 12 }}>
            {allItems.map((_: any, i: number) => (
              <View key={i} style={{ flex: 1, height: 5, borderRadius: 5, backgroundColor: i < currentIndex ? c.ink : i === currentIndex ? c.lav2 : c.line }} />
            ))}
          </View>
        )}
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: 10, paddingHorizontal: GUTTER, paddingBottom: insets.bottom + 120 }}
        enableOnAndroid
        extraScrollHeight={0}
        keyboardOpeningTime={0}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width - GUTTER * 2)}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
          <Tag label={currentItem?.videoUrl ? "Video lesson" : "Lesson"} tone="lav" />
          {currentItem?.completed && <Tag label="Done" tone="mint" icon={Check} />}
        </View>
        <T variant="title" style={{ marginBottom: 16 }}>
          {currentItem?.title?.trim()}
        </T>

        {currentItem?.videoUrl && (
          <View style={{ marginBottom: 18, borderRadius: 24, overflow: "hidden", backgroundColor: "#000" }}>
            <VideoView style={styles.video} player={player} fullscreenOptions={{ enable: true }} allowsPictureInPicture />
          </View>
        )}

        {/* Lesson content */}
        <View style={{ marginBottom: 24, minHeight: 200 }}>
          {loading && (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center", backgroundColor: c.bg, zIndex: 10 }}>
              <ActivityIndicator color={c.brand} size="large" />
            </View>
          )}
          <AutoHeightWebView
            source={{ uri: `https://www.satlearner.com/expo-course/${currentItem?.chapterId}/lessons/${currentItem?.id}` }}
            viewportContent="width=device-width, user-scalable=no"
            scalesPageToFit
            style={{ width: containerWidth || "100%", backgroundColor: c.bg }}
            scrollEnabled={false}
            customStyle={webCss}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
        </View>

        {/* Discussion */}
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <IconTile icon={MessageCircle} tone="butter" size={36} radius={12} />
            <T variant="h2">Discussion</T>
            {comments.length > 0 && <Tag label={String(comments.length)} />}
          </View>

          {loadingComments && token ? (
            <ActivityIndicator color={c.brand} style={{ paddingVertical: 20 }} />
          ) : comments.length === 0 ? (
            <Card style={{ borderStyle: "dashed", alignItems: "center", paddingVertical: 20 }}>
              <T variant="small" style={{ textAlign: "center" }}>
                No comments yet. Ask a question or share a tip.
              </T>
            </Card>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id} style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Avatar name={comment.author?.name} image={comment.author?.image} />
                  <T variant="bodyStrong" style={{ flex: 1, fontSize: 14 }}>
                    {comment.author?.name || "Student"}
                  </T>
                  {token && <LinkButton title="Reply" onPress={() => setReplyTo(comment.id)} />}
                </View>
                <T variant="body" style={{ fontSize: 14.5, lineHeight: 21 }}>
                  {comment.content}
                </T>
                {comment.replies?.map((reply: any) => (
                  <View key={reply.id} style={{ marginLeft: 12, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: c.lav2, gap: 4 }}>
                    <T variant="smallStrong">{reply.author?.name || "Anonymous"}</T>
                    <T variant="small" color={c.ink} style={{ fontFamily: Fonts.body }}>
                      {reply.content}
                    </T>
                  </View>
                ))}
              </Card>
            ))
          )}

          {token ? (
            <View style={{ gap: 10 }}>
              {replyTo && (
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: c.lav, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
                  <T variant="smallStrong" onPastel>
                    Replying to a comment
                  </T>
                  <Pressable hitSlop={8} onPress={() => setReplyTo(null)}>
                    <X size={16} color={c.onPastel} />
                  </Pressable>
                </View>
              )}
              <Field placeholder="Write a comment..." value={newComment} onChangeText={setNewComment} multiline />
              <PillButton
                title="Post comment"
                icon={Send}
                center
                tone="soft"
                loading={submitting}
                disabled={!newComment.trim()}
                onPress={postComment}
                style={{ minHeight: 48 }}
              />
            </View>
          ) : (
            <Card style={{ alignItems: "center", gap: 10 }}>
              <T variant="small">Log in to join the discussion</T>
              <LinkButton title="Log in" onPress={() => router.push("/login")} />
            </Card>
          )}
        </View>
      </KeyboardAwareScrollView>

      {/* Bottom action: always there, so the last lesson in a chapter can be finished too */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: GUTTER, paddingTop: 12, paddingBottom: insets.bottom + 14, backgroundColor: c.bg }}>
        {nextItem ? (
          <PillButton
            title={nextItem.type === "quiz" ? "Done, take the quiz" : "Done, next lesson"}
            icon={ArrowRight}
            loading={marking}
            onPress={() => finishLesson(handleNext)}
          />
        ) : (
          <PillButton title="Finish lesson" icon={Check} loading={marking} onPress={() => finishLesson(handleBack)} />
        )}
      </View>
    </View>
  );
}

function Avatar({ name, image }: { name?: string; image?: string }) {
  const c = usePalette();
  if (image) return <Image source={{ uri: image }} style={{ width: 34, height: 34, borderRadius: 17 }} />;
  return (
    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.butter, alignItems: "center", justifyContent: "center" }}>
      <T variant="smallStrong" onPastel>
        {name?.charAt(0).toUpperCase() || "S"}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  video: { width: "100%", aspectRatio: 16 / 9, backgroundColor: "black" },
});
