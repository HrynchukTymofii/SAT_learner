import { View, Text } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function TimeAlert() {
  return (
    <View className=" rounded-2xl overflow-hidden shadow-md">
      <LinearGradient
        colors={["#fee2e2", "#fca5a5"]} 
        start={[0, 0]}
        end={[1, 1]}
        style={{ padding: 12 }}

      >
        <View className="flex-row items-center gap-2">
          <AlertTriangle size={20} color="#ef4444" />
          <Text className="font-semibold text-red-500 ">
            Less than 5 minutes remaining!
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
