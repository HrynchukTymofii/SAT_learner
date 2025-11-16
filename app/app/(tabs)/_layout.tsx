import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Home, ClipboardCheck, BookOpen, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#06B6D4',
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8',
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <View style={[
            styles.tabBarBackground,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
            }
          ]} />
        ),
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 66 + insets.bottom,
          borderTopWidth: 1,
          borderTopColor: isDark ? '#1e293b' : '#e2e8f0',
          paddingTop: 4,
          paddingBottom: insets.bottom || 8,
          elevation: 0,
          shadowColor: '#06B6D4',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && {
                backgroundColor: isDark ? '#06B6D420' : '#06B6D415',
              }
            ]}>
              <Home
                size={24}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tests/index"
        options={{
          title: 'Tests',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && {
                backgroundColor: isDark ? '#06B6D420' : '#06B6D415',
              }
            ]}>
              <ClipboardCheck
                size={24}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="course/index"
        options={{
          title: 'Course',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && {
                backgroundColor: isDark ? '#06B6D420' : '#06B6D415',
              }
            ]}>
              <BookOpen
                size={24}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && {
                backgroundColor: isDark ? '#06B6D420' : '#06B6D415',
              }
            ]}>
              <User
                size={24}
                color={color}
                strokeWidth={focused ? 2.5 : 2}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  tabBarBackground: {
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


// import { Tabs } from 'expo-router';
// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import { HapticTab } from '@/components/HapticTab';
// import { IconSymbol } from '@/components/ui/IconSymbol';
// import { useColorScheme } from '@/hooks/useColorScheme';

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   const tabBarBackgroundColor =
//     colorScheme === 'dark'
//       ? 'rgba(15,23,42,0.92)' // dark slate
//       : 'rgba(255,255,255,0.92)'; // light semi-transparent

//   const activeIconColor = '#22d3ee'; // bright teal-blue
//   const inactiveIconColor = '#94a3b8'; // soft gray

//   return (
//     <Tabs
//       initialRouteName="index"
//       screenOptions={{
//         headerShown: false,
//         tabBarActiveTintColor: activeIconColor,
//         tabBarInactiveTintColor: inactiveIconColor,
//         tabBarButton: HapticTab,
//         tabBarBackground: () => (
//           <View style={[styles.tabBarBackground, { backgroundColor: tabBarBackgroundColor }]} />
//         ),
//         tabBarStyle: {
//           position: 'absolute',
//           bottom: 0,
//           left: 16,
//           right: 16,
//           height: 105,
//           borderRadius: 20,
//           elevation: 5,
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 5 },
//           shadowOpacity: 0.15,
//           shadowRadius: 10,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="tests/index"
//         options={{
//           title: 'Tests',
//           tabBarIcon: ({ color }) => <IconSymbol size={26} name="checkmark.circle.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="course/index"
//         options={{
//           title: 'Course',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="profile/index"
//         options={{
//           title: 'Profile',
//           tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
//         }}
//       />
//     </Tabs>
//   );
// }

// const styles = StyleSheet.create({
//   tabBarBackground: {
//     flex: 1,
//     borderTopEndRadius: 20,
//     borderTopStartRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 5 },
//     shadowOpacity: 0.15,
//     shadowRadius: 10,
//     elevation: 5,
//   },
// });
