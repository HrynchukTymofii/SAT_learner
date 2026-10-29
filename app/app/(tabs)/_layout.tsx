import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { usePalette } from '@/constants/palette';
import { Home, ClipboardCheck, BookOpen, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTour } from '@/context/TourContext';
import { TourTooltip } from '@/components/Tour/TourTooltip';
import { TOUR_STEPS, TOTAL_TOUR_STEPS, getTourStepInfo } from '@/constants/tourSteps'; 

export default function TabLayout() {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

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
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: c.navActiveInk,
        tabBarInactiveTintColor: c.navInk,
        tabBarButton: HapticTab,
        // Floating pill, centered above the home indicator
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom + 10,
          left: (width - TAB_BAR_WIDTH) / 2,
          width: TAB_BAR_WIDTH,
          height: TAB_BAR_HEIGHT,
          borderRadius: TAB_BAR_HEIGHT / 2,
          backgroundColor: c.nav,
          borderTopWidth: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingHorizontal: 7,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 14 },
          shadowOpacity: 0.35,
          shadowRadius: 18,
        },
        tabBarItemStyle: {
          height: TAB_BAR_HEIGHT,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIconStyle: {
          width: 50,
          height: 50,
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: c.navActive }]}>
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
              <View style={[styles.iconContainer, focused && { backgroundColor: c.navActive }]}>
                <ClipboardCheck
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
              <View style={[styles.iconContainer, focused && { backgroundColor: c.navActive }]}>
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
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && { backgroundColor: c.navActive }]}>
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

const TAB_BAR_WIDTH = 4 * 56 + 14;
const TAB_BAR_HEIGHT = 64;

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

