import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";

export default function NotAllowedByCatDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={open}
      onRequestClose={onClose}
    >
      {/* Blur background */}
      <BlurView intensity={80} tint="dark" className="flex-1 justify-center items-center px-6">
        <View className="bg-white dark:bg-stone-900 rounded-lg w-full max-w-md p-6 space-y-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ця тема не відповідає обраним Вами категоріям
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            Ви можете змінити категорії у налаштуваннях.
          </Text>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            className="mt-4 border border-gray-400 rounded-md py-3 w-full items-center"
          >
            <Text className="text-gray-700 dark:text-gray-300 font-medium">Закрити</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
}
