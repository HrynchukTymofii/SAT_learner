import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Tap } from '@/components/ds';
import { Fonts, usePalette } from '@/constants/palette';
import { Home, SquareCheckBig, BookOpen, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTour } from '@/context/TourContext';
import { TourTooltip } from '@/components/Tour/TourTooltip';
import { TOUR_STEPS, TOTAL_TOUR_STEPS, getTourStepInfo } from '@/constants/tourSteps'; 

export default function TabLayout() {
  const c = usePalette();
  const insets = useSafeAreaInsets();

  // Tour
  const { tourActive, currentStep, setCurrentStep, endTour, skipTour } = useTour();

  const handleTourNext = () => {
    if (currentStep === TOTAL_TOUR_STEPS - 1) {
      endTour();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleTourPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const testsInfo = getTourStepInfo(TOUR_STEPS.TESTS_TAB);
  const courseInfo = getTourStepInfo(TOUR_STEPS.COURSE_TAB);

  return (
    <Tabs
      initialRouteName="index"
      // Our own bar: React Navigation's default ignores the side margins and adds space under the icons on Android
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        sceneStyle: { backgroundColor: c.bg },
        tabBarActiveTintColor: c.navActiveInk,
        tabBarInactiveTintColor: c.navInk,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Home
                size={22}
                color={color}
                strokeWidth={focused ? 2.3 : 1.9}
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
            <TourTooltip
              visible={tourActive && currentStep === TOUR_STEPS.COURSE_TAB}
              onNext={handleTourNext}
              onPrev={handleTourPrev}
              onSkip={skipTour}
              onClose={() => {}}
              title={courseInfo?.title || ''}
              content={courseInfo?.content || ''}
              stepNumber={TOUR_STEPS.COURSE_TAB + 1}
              totalSteps={TOTAL_TOUR_STEPS}
              placement="top"
              nextButtonText="Next"
              skipButtonText="Skip Tour"
              showSkipButton={true}
              delayMs={600}
            >
              <View style={styles.iconContainer}>
                <BookOpen
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.3 : 1.9}
                />
              </View>
            </TourTooltip>
          ),
        }}
      />
      <Tabs.Screen
        name="tests/index"
        options={{
          title: 'Tests',
          tabBarIcon: ({ color, focused }) => (
            <TourTooltip
              visible={tourActive && currentStep === TOUR_STEPS.TESTS_TAB}
              onNext={handleTourNext}
              onPrev={handleTourPrev}
              onSkip={skipTour}
              onClose={() => {}}
              title={testsInfo?.title || ''}
              content={testsInfo?.content || ''}
              stepNumber={TOUR_STEPS.TESTS_TAB + 1}
              totalSteps={TOTAL_TOUR_STEPS}
              placement="top"
              nextButtonText="Next"
              skipButtonText="Skip Tour"
              showSkipButton={true}
              delayMs={600}
            >
              <View style={styles.iconContainer}>
                <SquareCheckBig
                  size={22}
                  color={color}
                  strokeWidth={focused ? 2.3 : 1.9}
                />
              </View>
            </TourTooltip>
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <User
                size={22}
                color={color}
                strokeWidth={focused ? 2.3 : 1.9}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const TAB_BAR_HEIGHT = 60;
// active tab gets a wide pill so the bigger bar doesn't look empty
const ICON_W = 26;
const ICON_H = 26;

const SIDE_PADDING = 14;
const CHIP_HEIGHT = 44;
// The active tab is this many times wider than the others, to fit its label
const ACTIVE_FLEX = 2;
const SLIDE_MS = 260;
const EASING = Easing.out(Easing.cubic);

/**
 * Bar attached to the bottom, rounded at the top (same as the PDR_ua app's ChipTabBar).
 * The active tab is a raised lavender chip with its icon and name; the others show only an icon.
 * The chip is one view that slides to the active tab; tab widths are shares of the row,
 * so its place is computed rather than measured and moves in step with the tabs.
 */
function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const unit = (width - SIDE_PADDING * 2) / (state.routes.length - 1 + ACTIVE_FLEX);
  const chipX = useSharedValue(state.index * unit);
  const pressed = useSharedValue(0);

  useEffect(() => {
    chipX.value = withTiming(state.index * unit, { duration: SLIDE_MS, easing: EASING });
  }, [state.index, unit, chipX]);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: chipX.value }, { translateY: pressed.value * 3 }],
    shadowOpacity: 1 - pressed.value,
    elevation: 3 * (1 - pressed.value),
  }));

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: TAB_BAR_HEIGHT + insets.bottom,
        paddingBottom: insets.bottom,
        paddingHorizontal: SIDE_PADDING,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        backgroundColor: c.nav,
        shadowColor: '#000',
        shadowOpacity: c.isDark ? 0.35 : 0.1,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: -6 },
        elevation: 12,
      }}
    >
      <View style={{ height: TAB_BAR_HEIGHT, flexDirection: 'row', alignItems: 'center' }}>
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              left: 0,
              top: (TAB_BAR_HEIGHT - CHIP_HEIGHT) / 2,
              width: unit * ACTIVE_FLEX,
              height: CHIP_HEIGHT,
              borderRadius: 15,
              backgroundColor: CHIP,
              shadowColor: CHIP_EDGE,
              shadowRadius: 0,
              shadowOffset: { width: 0, height: 3 },
            },
            chipStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;
          const label = options.title ?? route.name;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };
          return (
            <Animated.View key={route.key} layout={LinearTransition.duration(SLIDE_MS).easing(EASING)} style={{ flex: focused ? ACTIVE_FLEX : 1 }}>
              <Tap
                onPress={onPress}
                onPressIn={() => {
                  if (process.env.EXPO_OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  if (focused) pressed.value = withTiming(1, { duration: 60 });
                }}
                onPressOut={() => {
                  pressed.value = withTiming(0, { duration: 90 });
                }}
                onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={label}
                hitSlop={6}
              >
                {({ pressed: isPressed }) => (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                      height: CHIP_HEIGHT,
                      transform: [{ translateY: focused && isPressed ? 3 : 0 }],
                    }}
                  >
                    {/* dark icon on the lavender chip, grey on the bar (never white on white) */}
                    {options.tabBarIcon?.({ focused, color: focused ? '#0B0A0F' : c.navInk, size: 22 })}
                    {focused && (
                      <Animated.Text
                        entering={FadeIn.delay(SLIDE_MS / 3).duration(SLIDE_MS)}
                        exiting={FadeOut.duration(SLIDE_MS / 3)}
                        numberOfLines={1}
                        style={{ color: '#0B0A0F', fontSize: 15, fontFamily: Fonts.bodyBold }}
                      >
                        {label}
                      </Animated.Text>
                    )}
                  </View>
                )}
              </Tap>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

// Chip colours: lavender with a darker purple edge for the 3D look (same in both themes)
const CHIP = '#C9AAFB';
const CHIP_EDGE = '#9F7AEA';

const styles = StyleSheet.create({
  iconContainer: {
    width: ICON_W,
    height: ICON_H,

    alignItems: 'center',
    justifyContent: 'center',
  },
});

