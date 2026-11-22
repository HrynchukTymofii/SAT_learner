import React from "react";
import { Modal, View, Text, Pressable, Platform } from "react-native";
import { Download, Sparkles, X } from "lucide-react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { openAppStore } from "@/lib/version";

interface UpdateRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  forceUpdate?: boolean;
  updateMessage?: string;
  requiredVersion?: string;
}

export const UpdateRequiredModal = ({
  isOpen,
  onClose,
  forceUpdate = false,
  updateMessage,
  requiredVersion,
}: UpdateRequiredModalProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const handleUpdate = async () => {
    await openAppStore();
  };

  const storeName = Platform.OS === "ios" ? "App Store" : "Google Play";

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent
      onRequestClose={forceUpdate ? undefined : onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            padding: 24,
            borderRadius: 20,
            width: "100%",
            maxWidth: 340,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          {/* Header with close button (only if not force update) */}
          {!forceUpdate && (
            <View
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 1,
              }}
            >
              <Pressable
                onPress={onClose}
                style={{
                  padding: 8,
                  backgroundColor: isDark ? "#1e293b" : "#f3f4f6",
                  borderRadius: 8,
                }}
              >
                <X size={18} color={isDark ? "#9ca3af" : "#6b7280"} />
              </Pressable>
            </View>
          )}

          {/* Icon */}
          <View
            style={{
              alignItems: "center",
              marginBottom: 20,
              marginTop: forceUpdate ? 0 : 8,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: isDark ? "#164e63" : "#e0f7fa",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Sparkles size={36} color="#06B6D4" />
            </View>
          </View>

          {/* Title */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: isDark ? "#ffffff" : "#1f2937",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Update Available
          </Text>

          {/* Version info */}
          {requiredVersion && (
            <Text
              style={{
                fontSize: 14,
                color: "#06B6D4",
                textAlign: "center",
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              Version {requiredVersion}
            </Text>
          )}

          {/* Message */}
          <Text
            style={{
              fontSize: 15,
              color: isDark ? "#94a3b8" : "#64748b",
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 24,
            }}
          >
            {updateMessage ||
              `A new version of SAT Math Learner is available with exciting new features and improvements!`}
          </Text>

          {/* Update Button */}
          <Pressable
            onPress={handleUpdate}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#0891b2" : "#06B6D4",
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#06B6D4",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            })}
          >
            <Download size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text
              style={{
                color: "#ffffff",
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              Update on {storeName}
            </Text>
          </Pressable>

          {/* Later button (only if not force update) */}
          {!forceUpdate && (
            <Pressable
              onPress={onClose}
              style={{
                marginTop: 12,
                paddingVertical: 12,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: isDark ? "#64748b" : "#94a3b8",
                  fontWeight: "600",
                  fontSize: 14,
                }}
              >
                Maybe Later
              </Text>
            </Pressable>
          )}

          {/* Force update notice */}
          {forceUpdate && (
            <Text
              style={{
                marginTop: 16,
                fontSize: 12,
                color: isDark ? "#64748b" : "#94a3b8",
                textAlign: "center",
              }}
            >
              This update is required to continue using the app
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};
