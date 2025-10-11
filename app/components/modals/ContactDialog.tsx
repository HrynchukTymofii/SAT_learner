import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Linking } from "react-native";
import Modal from "react-native-modal";
import { Picker } from "@react-native-picker/picker";
import { sendMessage } from "@/lib/api/user";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  full?: boolean
}

export function ContactDialog({ isOpen, onClose, full = false }: ContactDialogProps) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const route = useRoute();
  const router = useRouter()
  const {token} = useAuth();

  useEffect(() => {
    if (topic === "mistake") {
      setMessage("Номер тесту:\nНомер теми:\n\nПовідомлення:");
    } else {
      setMessage("");
    }
  }, [topic]);

  const handleSubmit = async () => {
    if (!topic || !message) return;
    setLoading(true);

    if (!token) {
        router.push('/login');
        return; 
    }

    try {
        const currentRouteName = route.name;
        const fullMessage = `${message}\n\n---\nPage: mobile-app ${currentRouteName}`;
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
    }

  const openTelegram = () => {
    Linking.openURL("https://t.me/pdrtests2025_support");
  };

  return (
    <Modal isVisible={isOpen} onBackdropPress={onClose}>
      <View className="bg-white dark:bg-stone-900 p-6 rounded-2xl">
        <TouchableOpacity
        onPress={onClose}
        className="absolute top-3 right-4 z-10 p-1"
        >
            <Text className="text-2xl text-black dark:text-white">×</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black dark:text-white mb-4">Зворотній зв'язок</Text>

        <View className="border rounded-xl mb-4 dark:border-stone-200 px-4">
          <Picker selectedValue={topic} onValueChange={(value) => setTopic(value)} style={{ color: topic ? "#fff" : "#999" }} dropdownIconColor="#ccc">
            <Picker.Item label="Оберіть тему" value="" enabled={false}/>
            <Picker.Item label="Помилка в тесті" value="mistake" />
            <Picker.Item label="Проблема з системою" value="problem" />
            <Picker.Item label="Інше" value="other" />
          </Picker>
        </View>

        <TextInput
          className="border rounded-xl p-4 text-black dark:text-white h-48 dark:border-stone-200"
          multiline
          placeholder="Ваше повідомлення..."
          value={message}
          onChangeText={setMessage}
          placeholderTextColor="#999"
          style={{ textAlignVertical: 'top' }}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || !topic || !message}
          className="mt-4 bg-green-500 rounded-xl py-3"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold">Надіслати</Text>
          )}
        </TouchableOpacity>



        {full && (
          <View className="flex flex-col justify-center mt-4">
            <Text className="text-center text-stone-800 dark:text-white">
              Або
            </Text>
          <TouchableOpacity
            onPress={openTelegram}
            className="mt-3 bg-blue-500 rounded-xl py-3 flex-row justify-center items-center space-x-2"
          >
            <Svg width={20} height={20} viewBox="0 0 48 48">
              <Path
                fill="#29b6f6"
                d="M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z"
              />
              <Path
                fill="#fff"
                d="M33.95,15l-3.746,19.126c0,0-0.161,0.874-1.245,0.874c-0.576,0-0.873-0.274-0.873-0.274l-8.114-6.733 
                l-3.97-2.001l-5.095-1.355c0,0-0.907-0.262-0.907-1.012c0-0.625,0.933-0.923,0.933-0.923l21.316-8.468 
                c-0.001-0.001,0.651-0.235,1.126-0.234C33.667,14,34,14.125,34,14.5C34,14.75,33.95,15,33.95,15z"
              />
              <Path
                fill="#b0bec5"
                d="M23,30.505l-3.426,3.374c0,0-0.149,0.115-0.348,0.12c-0.069,0.002-0.143-0.009-0.219-0.043 
                l0.964-5.965L23,30.505z"
              />
              <Path
                fill="#cfd8dc"
                d="M29.897,18.196c-0.169-0.22-0.481-0.26-0.701-0.093L16,26c0,0,2.106,5.892,2.427,6.912 
                c0.322,1.021,0.58,1.045,0.58,1.045l0.964-5.965l9.832-9.096C30.023,18.729,30.064,18.416,29.897,18.196z"
              />
            </Svg>
            <Text className="text-white text-center font-semibold ml-2">
              Написати у Telegram
            </Text>
          </TouchableOpacity>
          </View>
        )}

      </View>
    </Modal>
  );
}
