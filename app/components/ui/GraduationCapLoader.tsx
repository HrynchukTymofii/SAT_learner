import React, { useEffect } from "react";
import { View } from "react-native";
import Svg, { Path, Ellipse, Polygon, Rect } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAuth } from "@/context/AuthContext";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

export default function GraduationCap3DLoader() {
  const { user } = useAuth();
  const progress = useSharedValue(0);

  // Golden color for PRO users, cyan for free users
  const isPro = user?.isPro;
  const strokeColor = isPro ? "#FFD700" : "#06B6D4";
  const fillColor = isPro ? "#FFD70022" : "#06B6D422";
  const fillColor2 = isPro ? "#FFD70033" : "#06B6D433";

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedTopProps = useAnimatedProps(() => {
    const dashArray = 400;
    const dashOffset = dashArray * (1 - progress.value);
    return { strokeDasharray: [dashArray], strokeDashoffset: dashOffset };
  });

  const animatedBottomProps = useAnimatedProps(() => {
    const dashArray = 200;
    const dashOffset = dashArray * (1 - progress.value);
    return { strokeDasharray: [dashArray], strokeDashoffset: dashOffset };
  });

  const animatedCylinderProps = useAnimatedProps(() => {
    const dashArray = 300;
    const dashOffset = dashArray * (1 - progress.value);
    return { strokeDasharray: [dashArray], strokeDashoffset: dashOffset };
  });

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
      <Svg width={140} height={120} viewBox="0 0 140 120">
        {/* Top 3D square (mortarboard) */}
        <AnimatedPolygon
          animatedProps={animatedTopProps}
          points="20,40 70,20 120,40 70,60"
          stroke={strokeColor}
          strokeWidth={3}
          fill={fillColor}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cylinder top ellipse (head base top) */}
        <AnimatedEllipse
          animatedProps={animatedCylinderProps}
          cx="70"
          cy="80"
          rx="22"
          ry="8"
          stroke={strokeColor}
          strokeWidth={3}
          fill={fillColor}
        />

        {/* Cylinder body */}
        <AnimatedPath
          animatedProps={animatedBottomProps}
          d="M48,80 v18 a22,8 0 0,0 44,0 v-18"
          stroke={strokeColor}
          strokeWidth={3}
          fill={fillColor2}
          strokeLinecap="round"
        />

        {/* Tassel */}
        <Path
          d="M70,20 v20 l10,10"
          stroke={strokeColor}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <Ellipse cx="80" cy="50" rx="2" ry="2" fill={strokeColor} />
      </Svg>
    </View>
  );
}
