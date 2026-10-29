import { MutableRefObject, useEffect, useRef } from "react";
import { BackHandler, Platform } from "react-native";
import { useNavigation } from "expo-router";

/**
 * Routes every way of leaving the quiz (Android back button, iOS swipe / header
 * back) through `leave`, so progress is saved first.
 *
 * `leavingRef` is set by `leave` itself: once it is true, the navigation that
 * `leave` starts is let through instead of being intercepted a second time.
 */
export function useLeaveGuard(leave: () => void, leavingRef: MutableRefObject<boolean>) {
  const navigation = useNavigation();

  // Listeners are added once; always call the latest `leave`
  const leaveRef = useRef(leave);
  leaveRef.current = leave;

  useEffect(() => {
    if (Platform.OS === "android") {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        leaveRef.current();
        return true;
      });
      return () => sub.remove();
    }

    return navigation.addListener("beforeRemove", (e: any) => {
      if (leavingRef.current) return;
      e.preventDefault();
      leaveRef.current();
    });
  }, [navigation]);
}
