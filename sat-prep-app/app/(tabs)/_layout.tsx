import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const tabBarBackgroundColor = colorScheme === 'dark'
    ? 'rgba(28, 25, 23, 0.96)' // dark semi-transparent for dark theme
    : 'rgba(255, 255, 255, 0.96)'; // light semi-transparent for light theme

  const activeIconColor = colorScheme === 'dark' 
    ? '#FBBF24' // golden yellow stands out on dark background
    : '#7C3AED'; // deep purple fits light mode gradients

  const inactiveIconColor = colorScheme === 'dark' 
    ? '#9CA3AF90' // gray with opacity for inactive
    : '#6B728090'; // slightly darker gray for light theme

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: activeIconColor,
        tabBarInactiveTintColor: inactiveIconColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 16 : 0,
          left: 16,
          right: 16,
          height: 110,
          backgroundColor: tabBarBackgroundColor,
          elevation: 0,
          borderTopWidth: 0,
          borderRadius: 20, // optional: rounded corners to match your card style
        },
      }}
    >
      <Tabs.Screen
        name="info/index"
        options={{
          title: 'Info',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tests/index"
        options={{
          title: 'Tests',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="checkmark.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Course',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
