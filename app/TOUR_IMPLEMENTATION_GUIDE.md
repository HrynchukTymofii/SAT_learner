# App Tour/Guide Implementation Guide

## Overview
The tour system helps users understand key features of the app:
- Study Plan
- Lessons & Quizzes
- Saved Questions
- Wrong Answers
- Exams

## Components Created

### 1. TourContext (`context/TourContext.tsx`)
Manages tour state globally:
- `tourActive`: Whether tour is currently running
- `currentStep`: Current step number (0-indexed)
- `shouldShowTour`: Whether to show tour (based on user preference)
- `startTour()`: Start the tour
- `endTour()`: Complete and save tour as done
- `skipTour()`: Skip tour and mark as done

### 2. TourTooltip Component (`components/Tour/TourTooltip.tsx`)
Reusable tooltip component for each tour step:
- Shows step number and total steps
- Has "Skip Tour", "Prev", and "Next" buttons
- Customizable placement (top, bottom, left, right, center)
- Dark mode support

## How to Add Tour to a Page

### Step 1: Define Tour Steps
Define what steps you want to show on that page:

```typescript
const TOUR_STEPS = {
  // For index.tsx (Explore page)
  RECENT_CHAPTERS: 0,
  CALENDAR: 1,
  STUDY_PLAN: 2,

  // For tests page
  SAVED_QUESTIONS: 3,
  WRONG_ANSWERS: 4,
  EXAMS: 5,

  // For course page
  LESSONS: 6,
  QUIZZES: 7,
};

const TOTAL_STEPS = 8;
```

### Step 2: Import Tour Context and Component

```typescript
import { useTour } from '@/context/TourContext';
import { TourTooltip } from '@/components/Tour/TourTooltip';
```

### Step 3: Add Tour State in Component

```typescript
export default function YourPage() {
  const { tourActive, currentStep, setCurrentStep, endTour, skipTour } = useTour();
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip when tour is active and on this page's step
  useEffect(() => {
    if (tourActive && currentStep >= TOUR_STEPS.YOUR_FIRST_STEP && currentStep <= TOUR_STEPS.YOUR_LAST_STEP) {
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  }, [tourActive, currentStep]);

  const handleNext = () => {
    if (currentStep === TOTAL_STEPS - 1) {
      endTour();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
```

### Step 4: Wrap Target Elements with TourTooltip

```typescript
<TourTooltip
  visible={showTooltip && currentStep === TOUR_STEPS.RECENT_CHAPTERS}
  onNext={handleNext}
  onPrev={handlePrev}
  onSkip={skipTour}
  onClose={() => setShowTooltip(false)}
  title="Recent Chapters"
  content="See your most recently accessed chapters here. Track your progress and continue where you left off."
  stepNumber={TOUR_STEPS.RECENT_CHAPTERS + 1}
  totalSteps={TOTAL_STEPS}
  placement="bottom"
  isLastStep={currentStep === TOTAL_STEPS - 1}
>
  {/* The element you want to highlight */}
  <View>
    {/* Your Recent Chapters content */}
  </View>
</TourTooltip>
```

## Example: Complete Implementation for index.tsx

```typescript
import { useTour } from '@/context/TourContext';
import { TourTooltip } from '@/components/Tour/TourTooltip';

const TOUR_STEPS = {
  RECENT_CHAPTERS: 0,
  CALENDAR: 1,
  STUDY_PLAN: 2,
  COURSE_TAB: 3, // Will navigate to course tab
  TESTS_TAB: 4,  // Will navigate to tests tab
};

const TOTAL_STEPS = 8;

export default function ExploreScreen() {
  const { tourActive, currentStep, setCurrentStep, endTour, skipTour } = useTour();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (tourActive && currentStep >= 0 && currentStep <= 2) {
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }

    // Navigate to different tabs for their tour steps
    if (tourActive && currentStep === 3) {
      router.push('/(tabs)/course');
    } else if (tourActive && currentStep === 4) {
      router.push('/(tabs)/tests');
    }
  }, [tourActive, currentStep]);

  const handleNext = () => {
    if (currentStep === TOTAL_STEPS - 1) {
      endTour();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView>
        {/* Recent Chapters Section */}
        <TourTooltip
          visible={showTooltip && currentStep === TOUR_STEPS.RECENT_CHAPTERS}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={skipTour}
          onClose={() => setShowTooltip(false)}
          title="Recent Chapters"
          content="View and continue your most recently studied chapters. Track your progress and pick up where you left off!"
          stepNumber={TOUR_STEPS.RECENT_CHAPTERS + 1}
          totalSteps={TOTAL_STEPS}
          placement="bottom"
        >
          <View>
            {/* Your Recent Chapters UI */}
          </View>
        </TourTooltip>

        {/* Calendar Section */}
        <TourTooltip
          visible={showTooltip && currentStep === TOUR_STEPS.CALENDAR}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={skipTour}
          onClose={() => setShowTooltip(false)}
          title="Study Calendar"
          content="Plan your study sessions and track your daily progress. Stay organized with our calendar feature!"
          stepNumber={TOUR_STEPS.CALENDAR + 1}
          totalSteps={TOTAL_STEPS}
          placement="top"
        >
          <View>
            {/* Your Calendar UI */}
          </View>
        </TourTooltip>

        {/* Study Plan Section */}
        <TourTooltip
          visible={showTooltip && currentStep === TOUR_STEPS.STUDY_PLAN}
          onNext={handleNext}
          onPrev={handlePrev}
          onSkip={skipTour}
          onClose={() => setShowTooltip(false)}
          title="Your Study Plan"
          content="Create and manage your daily study tasks. Mark items as complete to track your progress!"
          stepNumber={TOUR_STEPS.STUDY_PLAN + 1}
          totalSteps={TOTAL_STEPS}
          placement="top"
        >
          <View>
            {/* Your Study Plan UI */}
          </View>
        </TourTooltip>
      </ScrollView>
    </SafeAreaView>
  );
}
```

## Adding Tour Preference to Onboarding

Add a question during onboarding asking if users want the guide:

```typescript
// In onboarding.tsx or during first launch
await SecureStore.setItemAsync('onboardingAnswers', JSON.stringify({
  ...existingAnswers,
  wantsGuide: true, // or false based on user selection
}));
```

## Testing the Tour

1. Clear tour completion flag:
```typescript
await SecureStore.deleteItemAsync('tourCompleted');
```

2. Set wantsGuide to true:
```typescript
const answers = await SecureStore.getItemAsync('onboardingAnswers');
if (answers) {
  const parsed = JSON.parse(answers);
  parsed.wantsGuide = true;
  await SecureStore.setItemAsync('onboardingAnswers', JSON.stringify(parsed));
}
```

3. Restart the app

## Manual Tour Trigger

Add a button in settings/profile to restart the tour:

```typescript
import { useTour } from '@/context/TourContext';

function ProfileScreen() {
  const { startTour } = useTour();

  return (
    <TouchableOpacity onPress={startTour}>
      <Text>Restart App Tour</Text>
    </TouchableOpacity>
  );
}
```

## Tour Flow Across Pages

The tour should flow like this:
1. **Index/Explore Tab** (Steps 0-2): Recent Chapters → Calendar → Study Plan
2. **Course Tab** (Steps 3-4): Lessons → Quizzes
3. **Tests Tab** (Steps 5-7): Saved Questions → Wrong Answers → Exams

Use `router.push()` to navigate between tabs when the tour step changes.

## Customization

### Change Tooltip Colors
Edit `TourTooltip.tsx` styles to match your branding.

### Add More Steps
Just increment `TOTAL_STEPS` and add more `TourTooltip` components.

### Change Timing
Modify the delay in `TourContext.tsx`:
```typescript
setTimeout(() => {
  setTourActive(true);
}, 1000); // Change this delay
```
