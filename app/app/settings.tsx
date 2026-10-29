import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Key,
  Sun,
  Moon,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { updateUser, deleteUserAccount } from "@/lib/api/user";
import Toast from "react-native-toast-message";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useLogout } from "@/hooks/useLogout";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsScreen() {
  const router = useRouter();
  const { token, user, setUser } = useAuth();
  const logout = useLogout();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { themeMode, setThemeMode } = useTheme();

  const themeOptions: {
    label: string;
    value: "light" | "dark" | "system";
    icon: typeof Sun;
  }[] = [
    { label: "System Default", value: "system", icon: Sun },
    { label: "Light", value: "light", icon: Sun },
    { label: "Dark", value: "dark", icon: Moon },
  ];

  const handleAccountDeleted = async () => {
    // The account is gone on the server, so don't try to send its offline actions
    await logout({ flushQueue: false });
    router.replace("/");
    Toast.show({
      type: "success",
      text1: "Account deleted",
      position: "top",
      visibilityTime: 700,
    });
  };

  const handleSave = async () => {
    if (!token) return alert("User not authorized");
    if (password.length < 4) {
      Alert.alert("Error", "Password must be at least 4 characters.");
      return;
    }
    const result = await updateUser(token, { password });
    if (result.success) {
      if (user) setUser({ ...user });
      router.back();
      Toast.show({
        type: "success",
        text1: "Profile updated",
        position: "top",
        visibilityTime: 700,
      });
    } else alert(result.error);
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9" }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 12,
        paddingBottom: 16,
        paddingHorizontal: 16,
        backgroundColor: isDark ? "#0B0A0F" : "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: isDark ? "#17151C" : "#E5DFEE",
      }}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
            alignSelf: "flex-start",
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: isDark ? "#17151C" : "#EFEAF7",
            borderRadius: 12,
          }}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={isDark ? "#C9AAFB" : "#7A4BDB"} />
          <Text style={{ color: isDark ? "#C9AAFB" : "#7A4BDB", fontWeight: "600", marginLeft: 6, fontSize: 14 }}>
            Back
          </Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={{ fontSize: 24, fontWeight: "bold", color: isDark ? "#F4F1F8" : "#0B0A0F", marginBottom: 4 }}>
          Settings
        </Text>
        <Text style={{ fontSize: 14, color: isDark ? "#9C95A8" : "#6B6577" }}>
          Manage your account preferences
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Password Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Key size={20} color={isDark ? "#C9AAFB" : "#7A4BDB"} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                marginLeft: 8,
                color: isDark ? "#F4F1F8" : "#0B0A0F",
              }}
            >
              Change Password
            </Text>
          </View>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="New password"
            secureTextEntry
            style={{
              backgroundColor: isDark ? "#17151C" : "#ffffff",
              color: isDark ? "#F4F1F8" : "#0B0A0F",
              borderColor: isDark ? "#2B2733" : "#E5DFEE",
              borderWidth: 1,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
            }}
            placeholderTextColor={isDark ? "#7E7889" : "#9C95A8"}
          />
        </View>

        {/* Theme Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <Sun size={20} color={isDark ? "#C9AAFB" : "#7A4BDB"} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                marginLeft: 8,
                color: isDark ? "#F4F1F8" : "#0B0A0F",
              }}
            >
              App Theme
            </Text>
          </View>
          <View
            style={{
              backgroundColor: isDark ? "#17151C" : "#ffffff",
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: isDark ? "#2B2733" : "#E5DFEE",
            }}
          >
            {themeOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setThemeMode(option.value)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: themeMode === option.value ? "#8A5CE6" : (isDark ? "#7E7889" : "#9C95A8"),
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {themeMode === option.value && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#8A5CE6",
                      }}
                    />
                  )}
                </View>
                <Text style={{
                  marginLeft: 12,
                  fontSize: 16,
                  color: isDark ? "#F4F1F8" : "#0B0A0F",
                }}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity
          onPress={handleSave}
          style={{
            backgroundColor: "#8A5CE6",
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: "center",
            marginBottom: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 16 }}>
            Save Changes
          </Text>
        </TouchableOpacity>

        {/* Danger Zone */}
        <View style={{
          borderTopWidth: 1,
          borderTopColor: isDark ? "#2B2733" : "#E5DFEE",
          paddingTop: 24,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#D93F55",
            marginBottom: 12,
          }}>
            Danger Zone
          </Text>
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            style={{
              borderWidth: 2,
              borderColor: "#D93F55",
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              backgroundColor: isDark ? "#17151C" : "#ffffff",
            }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#D93F55", fontWeight: "600", fontSize: 16 }}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Delete Modal */}
      <Modal visible={showDeleteModal} animationType="slide" transparent>
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          paddingHorizontal: 24,
        }}>
          <View
            style={{
              backgroundColor: isDark ? "#17151C" : "#ffffff",
              borderRadius: 16,
              padding: 24,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 16,
                color: "#D93F55",
              }}
            >
              Confirm Deletion
            </Text>
            <Text style={{
              fontSize: 16,
              marginBottom: 12,
              color: isDark ? "#F4F1F8" : "#0B0A0F",
            }}>
              This action is irreversible. To confirm, type{" "}
              <Text style={{ fontWeight: "bold" }}>Delete</Text> below:
            </Text>

            <TextInput
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="Type Delete"
              style={{
                backgroundColor: isDark ? "#0B0A0F" : "#F4F1F9",
                color: isDark ? "#F4F1F8" : "#0B0A0F",
                borderColor: isDark ? "#2B2733" : "#E5DFEE",
                borderWidth: 1,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                marginBottom: 16,
              }}
              placeholderTextColor={isDark ? "#7E7889" : "#9C95A8"}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowDeleteModal(false);
                  setConfirmText("");
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: isDark ? "#2B2733" : "#E5DFEE",
                  alignItems: "center",
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: isDark ? "#F4F1F8" : "#0B0A0F", fontWeight: "600" }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  if (confirmText !== "Delete") {
                    Alert.alert("Error", "Type 'Delete' to confirm.");
                    return;
                  }
                  if (!token) return alert("User not authorized");

                  setIsDeleting(true);
                  const result = await deleteUserAccount(token);
                  setIsDeleting(false);

                  if (result.success) {
                    setShowDeleteModal(false);
                    await handleAccountDeleted();
                  } else {
                    alert(result.error || "Failed to delete account");
                  }
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: "#D93F55",
                  alignItems: "center",
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>
                  {isDeleting ? "Deleting..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
