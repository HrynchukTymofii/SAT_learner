import React from "react";
import { Modal, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { ShieldCheck, LogIn } from "lucide-react-native";
import { useRouter } from "expo-router";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginRequiredModal = ({ isOpen, onClose }: Props) => {
  const router = useRouter();
  const { width } = Dimensions.get("window");

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <View className="bg-white dark:bg-stone-800 p-8 rounded-2xl w-full max-w-md shadow-lg relative overflow-hidden">

          {/* Background shield centered */}
          <View style={{ position: "absolute", top: 16, left: '50%', transform: [{ translateX: -68 }], zIndex: 0 }}>
            <ShieldCheck size={200} color="rgba(34, 197, 94, 0.08)" />
          </View>

          {/* Header */}
          <View className="mb-6 z-10 items-center">
            <Text className="text-2xl font-bold text-green-700 dark:text-green-400 text-center">
              👋 Увійдіть, щоб отримати повний доступ!
            </Text>
          </View>

          {/* Subtext */}
          <Text className="text-center text-gray-700 dark:text-gray-300 mb-8 z-10">
            🔓 Синхронізуйте свій прогрес між вебом та мобільним додатком.
          </Text>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-green-600 py-4 rounded-xl items-center flex-row justify-center shadow-md z-10"
            onPress={() => {
              onClose();
              router.push("/login");
            }}
          >
            <LogIn size={20} color="white" />
            <Text className="text-white font-bold ml-3 text-base">
              Увійти / Зареєструватися
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};
