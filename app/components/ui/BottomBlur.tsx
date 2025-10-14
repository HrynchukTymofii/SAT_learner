import React from "react";
import { View, StyleSheet, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomBlur() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const backgroundColor = colorScheme === "light" ? "#f8fafc" : "#1c1917"; // light bg or dark bg

  return (
    <View style={[styles.cover, { height: insets.bottom, backgroundColor }]} />
  );
}

const styles = StyleSheet.create({
  cover: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
