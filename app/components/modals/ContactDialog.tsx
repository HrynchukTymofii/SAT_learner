import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { sendMessage } from "@/lib/api/user";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

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
      <View className="w-full flex-1 justify-center bg-black/50 px-4">
      <View
        style={{
          backgroundColor: isDark ? "#0f172a" : "#fff",
          padding: 24,
          borderRadius: 24,
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
          }}
        >
          <Text style={{ fontSize: 24, color: isDark ? "#fff" : "#000" }}>×</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 16, color: isDark ? "#fff" : "#1f2937" }}>
          Contact Support
        </Text>

        {/* Topic Picker */}
        <View
          style={{
            borderWidth: 1,
            borderColor: isDark ? "#374151" : "#e2e8f0",
            borderRadius: 16,
            marginBottom: 16,
            overflow: "hidden",
            backgroundColor: isDark ? "#1e293b" : "#f8fafc",
          }}
        >
          <Picker
            selectedValue={topic}
            onValueChange={(value) => setTopic(value)}
            dropdownIconColor={isDark ? "#fff" : "#6b7280"}
            style={{ color: topic ? (isDark ? "#fff" : "#111827") : "#9ca3af" }}
          >
            <Picker.Item label="Select topic" value="" enabled={false} />
            <Picker.Item label="Test mistake" value="mistake" />
            <Picker.Item label="System issue" value="problem" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>

        {/* Message Input */}
        <TextInput
          multiline
          placeholder="Your message..."
          placeholderTextColor={isDark ? "#9ca3af" : "#6b7280"}
          value={message}
          onChangeText={setMessage}
          style={{
            minHeight: 150,
            borderWidth: 1,
            borderColor: isDark ? "#374151" : "#e2e8f0",
            borderRadius: 16,
            padding: 16,
            textAlignVertical: "top",
            color: isDark ? "#fff" : "#1f2937",
            backgroundColor: isDark ? "#1e293b" : "#f8fafc",
            marginBottom: 16,
          }}
        />

        {/* Submit Button */}
        <LinearGradient
          colors={["#3b82f6", "#2563eb"]}
          start={[0, 0]}
          end={[1, 1]}
          style={{ borderRadius: 16 }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !topic || !message}
            style={{
              paddingVertical: 14,
              alignItems: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>Send</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
      </View>
    </Modal>
  );
}
