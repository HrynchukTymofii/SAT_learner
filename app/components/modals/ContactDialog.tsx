import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { sendMessage } from "@/lib/api/user";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { X, AlertCircle, Bug, HelpCircle } from "lucide-react-native";

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export function ContactDialog({ isOpen, onClose, isDark }: ContactDialogProps) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (topic === "mistake") {
      setMessage("Test number:\nTopic number:\n\nMessage:");
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
      const isDarkMessage = `${message}\n\n---\nPage: mobile-app ${currentRouteName}`;
      const success = await sendMessage(token, topic, isDarkMessage);

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
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
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
              backgroundColor: isDark ? "#334155" : "#f3f4f6",
              borderRadius: 8,
            }}
            activeOpacity={0.7}
          >
            <X size={20} color={isDark ? "#ffffff" : "#1f2937"} />
          </TouchableOpacity>

          {/* Title */}
          <Text style={{
            fontSize: 20,
            fontWeight: "700",
            marginBottom: 20,
            color: isDark ? "#ffffff" : "#1f2937",
            paddingLeft: 8
          }}>
            Contact Support
          </Text>

          {/* Topic Selection */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: "600",
              color: isDark ? "#ffffff" : "#1f2937",
              marginBottom: 8,
              paddingLeft: 8
            }}>
              Select Topic
            </Text>
            <View
              style={{
                backgroundColor: isDark ? "#0f172a" : "#f9fafb",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#e5e7eb",
                padding: 8,
              }}
            >
              {[
                { label: "Test mistake", value: "mistake", icon: AlertCircle },
                { label: "System issue", value: "problem", icon: Bug },
                { label: "Other", value: "other", icon: HelpCircle },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = topic === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setTopic(option.value)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      marginBottom: 4,
                      backgroundColor: isSelected ? "#06B6D4" : "transparent",
                    }}
                    activeOpacity={0.7}
                  >
                    <Icon
                      size={20}
                      color={isSelected ? "#ffffff" : (isDark ? "#9ca3af" : "#6b7280")}
                      style={{ marginRight: 12 }}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        color: isSelected ? "#ffffff" : (isDark ? "#ffffff" : "#1f2937"),
                        fontWeight: isSelected ? "600" : "400",
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Message Input */}
          <TextInput
            multiline
            placeholder="Your message..."
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={message}
            onChangeText={setMessage}
            style={{
              minHeight: 150,
              borderWidth: 1,
              borderColor: isDark ? "#334155" : "#e5e7eb",
              borderRadius: 12,
              padding: 16,
              textAlignVertical: "top",
              color: isDark ? "#ffffff" : "#1f2937",
              backgroundColor: isDark ? "#0f172a" : "#f9fafb",
              marginBottom: 16,
              fontSize: 16,
            }}
          />

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !topic || !message}
            style={{
              backgroundColor: loading || !topic || !message ? (isDark ? "#334155" : "#d1d5db") : "#06B6D4",
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
                color: loading || !topic || !message ? (isDark ? "#9ca3af" : "#6b7280") : "#ffffff",
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
