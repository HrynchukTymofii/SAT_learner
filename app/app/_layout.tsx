import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "../global.css";

import { useColorScheme } from '@/hooks/useColorScheme';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const done = await SecureStore.getItemAsync("onboardingCompleted");
      setShowOnboarding(!done);
    };
    checkOnboarding();
  }, []);

  if (!loaded || showOnboarding === null) {
    // Async font loading and onboarding check
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          {showOnboarding ? (
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          )}
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toast />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
