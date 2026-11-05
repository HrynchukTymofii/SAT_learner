import { ActivityIndicator, Image, View, useColorScheme as useSystemColorScheme } from "react-native";
import { Palette, Pastel } from "@/constants/palette";

/**
 * Shown while fonts and the database load (before the theme provider exists,
 * so it follows the phone's theme and uses system fonts).
 */
export default function CustomPreloadScreen() {
  const dark = useSystemColorScheme() === "dark";
  const p = dark ? Palette.dark : Palette.light;
  return (
    <View style={{ flex: 1, backgroundColor: p.bg, alignItems: "center", justifyContent: "center", gap: 28 }}>
      <View style={{ width: 112, height: 112, borderRadius: 36, backgroundColor: Pastel.lav, alignItems: "center", justifyContent: "center" }}>
        <Image source={require("@/assets/images/splash-icon-light.png")} style={{ width: 72, height: 72 }} resizeMode="contain" />
      </View>
      <ActivityIndicator color={p.brand} />
    </View>
  );
}
