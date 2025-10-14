import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Trash2, RotateCcw } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ResetTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  testTitle: string;
}

export const ResetTestDialog = ({
  isOpen,
  onClose,
  onConfirm,
  testTitle,
}: ResetTestDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error resetting test:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-4">
        <View className="bg-white dark:bg-[#0f172a] p-6 rounded-2xl w-full max-w-md shadow-lg shadow-black/30">
          {/* Header */}
          <View className="flex-row items-center justify-center mb-4">
            <Trash2 size={24} color="#dc2626" />
            <Text className="text-xl font-extrabold text-red-600 dark:text-red-400 ml-2">
              Clear Results?
            </Text>
          </View>

          {/* Description */}
          <Text className="text-gray-700 dark:text-gray-200 text-base text-center mb-5">
            You’ve already taken{" "}
            <Text className="text-black dark:text-white font-semibold">
              “{testTitle}”
            </Text>
            . Do you want to delete your previous results and start over?
          </Text>

          {/* Buttons */}
          <View className="flex-row gap-3">
            {/* Cancel */}
            <Pressable
              onPress={onClose}
              disabled={isLoading}
              className="flex-1 rounded-2xl bg-blue-50 border border-blue-500 py-3 items-center justify-center shadow-sm"
            >
              <Text className="text-blue-600 dark:text-blue-400 font-semibold">
                Cancel
              </Text>
            </Pressable>

            {/* Confirm */}
            <Pressable
              disabled={isLoading}
              onPress={handleConfirm}
              className={`flex-1 rounded-2xl  shadow-md shadow-blue-400/30 ${
                isLoading ? "opacity-70" : ""
              }`}
            >
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                start={[0, 0]}
                end={[1, 1]}
                style={{
                  paddingVertical: 12, // py-3
                  borderRadius: 16, // rounded-2xl
                  flexDirection: "row", // flex-row
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <RotateCcw size={16} color="#fff" />
                    <Text className="text-white font-semibold ml-2">
                      Reset
                    </Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
