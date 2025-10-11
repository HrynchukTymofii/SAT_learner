import { View, Text } from "react-native"

export default function InfoScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-semibold">Profile Info Page</Text>
      <Text className="text-slate-600">Here you can show user details, settings, etc.</Text>
    </View>
  )
}
