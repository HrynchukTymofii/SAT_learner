import React from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TopBlur() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  // Choose tint based on theme
  const tint = colorScheme === "light" ? "light" : "dark";

  return (
    <BlurView
      intensity={80}
      tint={tint}
      style={[styles.blur, { height: insets.top }]}
    />
  );
}

const styles = StyleSheet.create({
  blur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
