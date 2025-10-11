import React, { useState } from "react"
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from "react-native"
import { Trash2, RotateCcw } from "lucide-react-native"

interface ResetTestDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  testTitle: string
}

export const ResetTestDialog = ({ isOpen, onClose, onConfirm, testTitle }: ResetTestDialogProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error("Error resetting test:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal visible={isOpen} animationType="slide" onRequestClose={onClose} transparent >
      <View className="flex-1 justify-center items-center bg-black/60 px-4">
        <View className="bg-white dark:bg-stone-900 p-6 rounded-xl w-full max-w-md">
          <View className="flex-row items-center justify-center mb-4">
            <Trash2 size={24} color="#dc2626" />
            <Text className="text-xl font-bold text-red-600 ml-2">Очистити результати?</Text>
          </View>

          <Text className="text-gray-700 dark:text-stone-100 text-base text-center mb-4">
            Ви вже проходили тест{" "}
            <Text className="text-black dark:text-stone-300 font-semibold">"{testTitle}"</Text>. Бажаєте видалити попередні результати та почати заново?
          </Text>

          <View className="flex-row gap-x-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 border border-green-500 rounded-md py-3 items-center"
              disabled={isLoading}
            >
              <Text className="text-green-500 font-semibold">Скасувати</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              className={`flex-1 flex-row items-center justify-center bg-green-500 dark:bg-green-600 rounded-md py-3 ${isLoading ? "opacity-70" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <RotateCcw size={16} color="white" />
                  <Text className="text-white font-semibold ml-2">Очистити</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}
