import React, { useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Easing,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pending?: boolean;
}

const proFeatures = [
  "Доступ до усіх офіційних питань",
  "Доступ до всього курсу",
  "Збережені та Неправильні питання",
];

export const GetPremiumModal = ({ isOpen, onClose, pending }: Props) => {
  const router = useRouter();
  const borderAnim = useRef(new Animated.Value(0)).current;
  const scaleAnimMonthly = useRef(new Animated.Value(1)).current;
  const scaleAnimUnlimited = useRef(new Animated.Value(1)).current;

  // Glowing border animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(borderAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(borderAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, []);

  // Button pulse animations
  useEffect(() => {
    const pulse = (anim: Animated.Value) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.03,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    pulse(scaleAnimMonthly);
    pulse(scaleAnimUnlimited);
  }, []);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#16a34a", "#a3e635"],
  });

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center bg-black/50 px-4">
        <Animated.View
          style={{
            borderWidth: 3,
            borderColor,
            borderRadius: 16,
            padding: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 6,
            elevation: 5,
          }}
          className="bg-white dark:bg-stone-800 w-full max-w-md"
        >
          {/* Header */}
          <View className="mb-4 items-center">
            <Text className="text-2xl font-bold text-green-700 dark:text-green-400 text-center">
              🔥 Оновіть до PRO
            </Text>
            <Text className="text-center text-gray-700 dark:text-gray-300 mt-2">
              Ви використовуєте 50% тестів. Отримайте повний доступ до всього курсу!
            </Text>
          </View>

          {/* Features */}
          <ScrollView className="mb-6 max-h-44" showsVerticalScrollIndicator={false}>
            {proFeatures.map((feature, index) => (
              <View
                key={index}
                className="flex-row items-center mb-2 px-3 py-2 rounded-md bg-green-50 dark:bg-stone-700"
              >
                <FontAwesome5 name="check" size={14} color="#a3e635" style={{ marginRight: 8 }} />
                <Text className="text-gray-800 dark:text-gray-200">{feature}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Plans */}
          <View className="flex flex-row gap-3 mb-4">
            <Animated.View style={{ transform: [{ scale: scaleAnimMonthly }] }} className="flex-1">
              <TouchableOpacity
                className="bg-green-700 py-4 rounded-xl items-center shadow-md"
                onPress={() => {
                  onClose();
                  router.push({
                    pathname: "/payment",
                    params: { plan: "monthly" },
                  });
                }}
              >
                <Text className="text-white font-bold text-lg">199₴ / міс</Text>
                <Text className="text-white text-sm mt-1">Доступ на місяць</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: scaleAnimUnlimited }] }} className="flex-1 relative">
              <TouchableOpacity
                className="bg-green-600 py-4 rounded-xl items-center shadow-md"
                onPress={() => {
                  onClose();
                  router.push({
                    pathname: "/payment",
                    params: { plan: "forever" },
                  });
                }}
              >
                <Text className="text-white font-bold text-lg">399₴</Text>
                <Text className="text-white text-sm mt-1">Доступ назавжди</Text>
              </TouchableOpacity>
              {/* Badge */}
              <View className="absolute -top-2 right-2 bg-amber-400 px-2 py-1 rounded-full shadow-md">
                <Text className="text-xs font-bold text-black">Популярне</Text>
              </View>
            </Animated.View>
          </View>

          {/* Alternative actions */}
          <View className="mt-2 w-full items-center">
            <TouchableOpacity
                className="bg-gray-200 dark:bg-stone-700 px-6 py-2 rounded-full"
                activeOpacity={0.7}
                onPress={onClose}
            >
                <Text className="text-gray-600 dark:text-gray-300 font-semibold text-center">
                Пізніше, мені підходить 50%
                </Text>
            </TouchableOpacity>
            </View>

          {/* Pending overlay */}
          {pending && (
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: "rgba(0,0,0,0.3)",
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};
