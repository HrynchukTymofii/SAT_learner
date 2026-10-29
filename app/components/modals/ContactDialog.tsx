import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { sendMessage } from "@/lib/api/user";
import { useRoute } from "expo-router/react-navigation";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  contextData?: {
    questionId?: string;
    quizId?: string;
    lessonId?: string;
    chapterId?: string;
    [key: string]: any;
  };
}

export function ContactDialog({ isOpen, onClose, isDark, contextData }: ContactDialogProps) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (topic === "mistake") {
      setMessage("Topic name:\nProblem number:\n\nMessage:");
    } else {
      setMessage("");
    }
  }, [topic]);

  const handleSubmit = async () => {
    if (!topic || !message) return;
    setLoading(true);

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const currentRouteName = route.name;
      let contextInfo = `\n\n---\nPage: mobile-app ${currentRouteName}`;

      // Add context data if available
      if (contextData && Object.keys(contextData).length > 0) {
        contextInfo += `\nContext: ${JSON.stringify(contextData, null, 2)}`;
      }

      const fullMessage = `${message}${contextInfo}`;
      const success = await sendMessage(token, topic, fullMessage);

      if (!success) throw new Error("Failed to send message");

      setTopic("");
      setMessage("");
      onClose();
    } catch (err) {
      console.error("❌ Error submitting message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} onRequestClose={onClose} transparent animationType="slide">
      <View style={{
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        paddingHorizontal: 16,
      }}>
        <View
          style={{
            backgroundColor: isDark ? "#17151C" : "#ffffff",
            padding: 16,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
              padding: 8,
              backgroundColor: isDark ? "#2B2733" : "#EFEAF7",
              borderRadius: 8,
            }}
            activeOpacity={0.7}
          >
            <X size={20} color={isDark ? "#F4F1F8" : "#0B0A0F"} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={{
            fontSize: 20,
            fontWeight: "700",
            marginBottom: 20,
            color: isDark ? "#F4F1F8" : "#0B0A0F",
            paddingLeft: 8
          }}>
            Contact Support
          </Text>

          {/* Topic Selection */}
          <Text style={{
            fontSize: 14,
            color: isDark ? "#9C95A8" : "#6B6577",
            marginBottom: 8,
            paddingLeft: 8
          }}>
            Select a topic:
          </Text>
          <View style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
          }}>
            <TouchableOpacity
              onPress={() => setTopic("mistake")}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: topic === "mistake" ? "#8A5CE6" : (isDark ? "#2B2733" : "#E5DFEE"),
                backgroundColor: topic === "mistake" ? "#8A5CE6" : (isDark ? "#17151C" : "#ffffff"),
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                fontWeight: "600",
                color: topic === "mistake" ? "#ffffff" : (isDark ? "#F4F1F8" : "#0B0A0F"),
              }}>
                Test Error
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTopic("problem")}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: topic === "problem" ? "#8A5CE6" : (isDark ? "#2B2733" : "#E5DFEE"),
                backgroundColor: topic === "problem" ? "#8A5CE6" : (isDark ? "#17151C" : "#ffffff"),
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                fontWeight: "600",
                color: topic === "problem" ? "#ffffff" : (isDark ? "#F4F1F8" : "#0B0A0F"),
              }}>
                System Issue
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTopic("other")}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: topic === "other" ? "#8A5CE6" : (isDark ? "#2B2733" : "#E5DFEE"),
                backgroundColor: topic === "other" ? "#8A5CE6" : (isDark ? "#17151C" : "#ffffff"),
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                fontWeight: "600",
                color: topic === "other" ? "#ffffff" : (isDark ? "#F4F1F8" : "#0B0A0F"),
              }}>
                Other
              </Text>
            </TouchableOpacity>
          </View>

          {/* Message Input */}
          <TextInput
            multiline
            placeholder="Your message..."
            placeholderTextColor={isDark ? "#7E7889" : "#9C95A8"}
            value={message}
            onChangeText={setMessage}
            style={{
              minHeight: 150,
              borderWidth: 1,
              borderColor: isDark ? "#2B2733" : "#E5DFEE",
              borderRadius: 12,
              padding: 16,
              textAlignVertical: "top",
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9",
              marginBottom: 16,
              fontSize: 16,
            }}
          />

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !topic || !message}
            style={{
              backgroundColor: loading || !topic || !message ? (isDark ? "#2B2733" : "#D9D2E5") : "#8A5CE6",
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={{
                color: loading || !topic || !message ? (isDark ? "#9C95A8" : "#6B6577") : "#ffffff",
                fontWeight: "600",
                fontSize: 16,
              }}>
                Send
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
