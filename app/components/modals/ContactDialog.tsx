import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { useRoute } from "expo-router/react-navigation";
import { useRouter } from "expo-router";
import { Bug, CircleAlert, Mails, MessageCircle, Send } from "lucide-react-native";
import { sendMessage } from "@/lib/api/user";
import { useAuth } from "@/context/AuthContext";
import { Chip, Field, PillButton } from "@/components/ds";
import { Sheet } from "@/components/ds/overlays";

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** kept for older callers; the sheet follows the app theme */
  isDark?: boolean;
  contextData?: {
    questionId?: string;
    quizId?: string;
    lessonId?: string;
    chapterId?: string;
    [key: string]: any;
  };
}

const TOPICS = [
  { value: "mistake", label: "Mistake in a question", icon: CircleAlert },
  { value: "problem", label: "App problem", icon: Bug },
  { value: "other", label: "Something else", icon: MessageCircle },
] as const;

export function ContactDialog({ isOpen, onClose, contextData }: ContactDialogProps) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    setMessage(topic === "mistake" ? "Topic name:\nProblem number:\n\nMessage:" : "");
  }, [topic]);

  const handleSubmit = async () => {
    if (!topic || !message.trim()) return;
    if (!token) {
      onClose();
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      let contextInfo = `\n\n---\nPage: mobile-app ${route.name}`;
      if (contextData && Object.keys(contextData).length > 0) contextInfo += `\nContext: ${JSON.stringify(contextData, null, 2)}`;
      const ok = await sendMessage(token, topic, `${message}${contextInfo}`);
      if (!ok) throw new Error("Failed to send message");
      setTopic("");
      setMessage("");
      onClose();
      Toast.show({ type: "success", text1: "Message sent", text2: "We'll get back to you by email" });
    } catch (err) {
      console.error("❌ Error submitting message:", err);
      Toast.show({ type: "error", text1: "Couldn't send the message", text2: "Please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      visible={isOpen}
      onClose={onClose}
      icon={Mails}
      tone="butter"
      title="Contact us"
      text="Found a mistake or something isn't working? Tell us and we'll fix it."
      scroll
      footer={<PillButton title={token ? "Send" : "Log in to send"} icon={Send} loading={loading} disabled={!topic || !message.trim()} onPress={handleSubmit} />}
    >
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {TOPICS.map((t) => (
          <Chip key={t.value} label={t.label} icon={t.icon} active={topic === t.value} onPress={() => setTopic(t.value)} />
        ))}
      </View>
      <Field multiline value={message} onChangeText={setMessage} placeholder="Your message..." />
    </Sheet>
  );
}
