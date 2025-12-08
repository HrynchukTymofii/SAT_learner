# Complete Tour Implementation - Copy & Paste Guide

## ✅ Already Completed:
1. ✅ Tour infrastructure (TourContext, TourTooltip)
2. ✅ Tour steps defined in `constants/tourSteps.ts`
3. ✅ Study Plan tour on index page

## 🚀 Course Page Tour (app/(tabs)/course/index.tsx)

### Add imports at the top:
```typescript
import { useTour } from '@/context/TourContext';
import { TourTooltip } from '@/components/Tour/TourTooltip';
import { TOUR_STEPS, TOTAL_TOUR_STEPS } from '@/constants/tourSteps';
```

### Add tour state in component:
```typescript
export default function CourseIndexScreen() {
  // ... existing state
  const { tourActive, currentStep, setCurrentStep, endTour, skipTour, setNumbersQuizId } = useTour();

  // Find the Numbers chapter and a quiz in it
  React.useEffect(() => {
    if (tourActive && course.length > 0) {
      const numbersChapter = course.find(ch => ch.title.toLowerCase().includes('number'));
      if (numbersChapter) {
        const firstQuiz = numbersChapter.items.find(item => item.type === 'quiz');
        if (firstQuiz) {
          setNumbersQuizId(firstQuiz.id);
        }
      }
    }
  }, [tour Active, course]);

  // Navigation logic
  React.useEffect(() => {
    if (tourActive) {
      if (currentStep === TOUR_STEPS.ENTER_QUIZ) {
        // Navigate to first quiz in Numbers chapter
        const numbersChapter = course.find(ch => ch.title.toLowerCase().includes('number'));
        if (numbersChapter) {
          const firstQuiz = numbersChapter.items.find(item => item.type === 'quiz');
          if (firstQuiz) {
            router.push(`/course/${numbersChapter.id}/quiz/${firstQuiz.id}`);
          }
        }
      } else if (currentStep === TOUR_STEPS.TESTS_TAB) {
        router.push('/(tabs)/tests');
      }
    }
  }, [tourActive, currentStep]);

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
```

### Wrap the chapter list section:
Find where chapters are rendered and wrap with TourTooltip for LESSONS and QUIZZES steps:

```typescript
{/* Chapter Cards */}
{course.map((chapter, chapterIndex) => {
  const isNumbersChapter = chapter.title.toLowerCase().includes('number');
  const firstLesson = chapter.items.find(item => item.type === 'lesson');
  const firstQuiz = chapter.items.find(item => item.type === 'quiz');

  return (
    <View key={chapter.id}>
      {/* LESSONS TOUR - Show on first lesson of first chapter */}
      {chapterIndex === 0 && firstLesson && (
        <TourTooltip
          visible={tourActive && currentStep === TOUR_STEPS.LESSONS_SECTION}
          onNext={handleTourNext}
          onPrev={handleTourPrev}
          onSkip={skipTour}
          onClose={() => {}}
          title="Lessons"
          content="Each chapter contains lessons to teach you concepts. Lessons with video icons 🎥 include video explanations!"
          stepNumber={TOUR_STEPS.LESSONS_SECTION + 1}
          totalSteps={TOTAL_TOUR_STEPS}
          placement="bottom"
        >
          {/* Your chapter UI */}
        </TourTooltip>
      )}

      {/* QUIZZES TOUR - Show on first quiz */}
      {isNumbersChapter && firstQuiz && (
        <TourTooltip
          visible={tourActive && currentStep === TOUR_STEPS.QUIZZES_SECTION}
          onNext={handleTourNext}
          onPrev={handleTourPrev}
          onSkip={skipTour}
          onClose={() => {}}
          title="Quizzes"
          content="Practice what you've learned with quizzes. Track your scores and improve your performance!"
          stepNumber={TOUR_STEPS.QUIZZES_SECTION + 1}
          totalSteps={TOTAL_TOUR_STEPS}
          placement="bottom"
        >
          {/* Your chapter UI */}
        </TourTooltip>
      )}
    </View>
  );
})}
```

## 🎯 Quiz Page Tour (app/course/[chapterId]/quiz/[quizId]/index.tsx)

### Add imports:
```typescript
import { useTour } from '@/context/TourContext';
import { TourTooltip } from '@/components/Tour/TourTooltip';
import { TOUR_STEPS, TOTAL_TOUR_STEPS } from '@/constants/tourSteps';
```

### Add tour state:
```typescript
const { tourActive, currentStep, setCurrentStep, endTour, skipTour, numbersQuizId } = useTour();
const [showTourTooltip, setShowTourTooltip] = useState(false);

// Only show tour if this is the Numbers quiz
React.useEffect(() => {
  if (tourActive && quizId === numbersQuizId && currentStep >= TOUR_STEPS.ANSWER_QUESTION && currentStep <= TOUR_STEPS.SAVE_QUESTION) {
    setShowTourTooltip(true);
  } else {
    setShowTourTooltip(false);
  }
}, [tourActive, currentStep, quizId, numbersQuizId]);

// Navigate to tests tab when quiz tour is done
React.useEffect(() => {
  if (tourActive && currentStep === TOUR_STEPS.TESTS_TAB) {
    router.push('/(tabs)/tests');
  }
}, [tourActive, currentStep]);

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
```

### Wrap quiz elements:

```typescript
{/* Answer Options Tour */}
<TourTooltip
  visible={showTourTooltip && currentStep === TOUR_STEPS.ANSWER_QUESTION}
  onNext={handleTourNext}
  onPrev={handleTourPrev}
  onSkip={skipTour}
  onClose={() => {}}
  title="Answer Questions"
  content="Select your answer by tapping on the options. You can select multiple answers if needed!"
  stepNumber={TOUR_STEPS.ANSWER_QUESTION + 1}
  totalSteps={TOTAL_TOUR_STEPS}
  placement="top"
>
  {/* Your answer options UI */}
</TourTooltip>

{/* Hint Button Tour */}
<TourTooltip
  visible={showTourTooltip && currentStep === TOUR_STEPS.USE_HINT}
  onNext={handleTourNext}
  onPrev={handleTourPrev}
  onSkip={skipTour}
  onClose={() => {}}
  title="Get Hints"
  content="Stuck? Tap the hint button to get helpful guidance without revealing the answer!"
  stepNumber={TOUR_STEPS.USE_HINT + 1}
  totalSteps={TOTAL_TOUR_STEPS}
  placement="bottom"
>
  <TouchableOpacity onPress={showHint}>
    {/* Hint button UI */}
  </TouchableOpacity>
</TourTooltip>

{/* Restart Button Tour */}
<TourTooltip
  visible={showTourTooltip && currentStep === TOUR_STEPS.RESTART_TEST}
  onNext={handleTourNext}
  onPrev={handleTourPrev}
  onSkip={skipTour}
  onClose={() => {}}
  title="Restart Test"
  content="Want to try again? Use the restart button to clear your answers and start fresh!"
  stepNumber={TOUR_STEPS.RESTART_TEST + 1}
  totalSteps={TOTAL_TOUR_STEPS}
  placement="bottom"
>
  <TouchableOpacity onPress={restartQuiz}>
    {/* Restart button UI */}
  </TouchableOpacity>
</TourTooltip>

{/* Save Button Tour */}
<TourTooltip
  visible={showTourTooltip && currentStep === TOUR_STEPS.SAVE_QUESTION}
  onNext={handleTourNext}
  onPrev={handleTourPrev}
  onSkip={skipTour}
  onClose={() => {}}
  title="Save Questions"
  content="Save important questions to review later. Find them in the Tests tab under 'Saved'!"
  stepNumber={TOUR_STEPS.SAVE_QUESTION + 1}
  totalSteps={TOTAL_TOUR_STEPS}
  placement="bottom"
>
  <TouchableOpacity onPress={saveQuestion}>
    {/* Save button UI */}
  </TouchableOpacity>
</TourTooltip>
```

## 📝 Tests Page Tour (app/(tabs)/tests/index.tsx)

### Add imports:
```typescript
import { useTour } from '@/context/TourContext';
import { TourTooltip } from '@/components/Tour/TourTooltip';
import { TOUR_STEPS, TOTAL_TOUR_STEPS } from '@/constants/tourSteps';
```

### Add tour state:
```typescript
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
```

### Wrap tests sections:

```typescript
{/* Wrong Answers Section */}
<TourTooltip
  visible={tourActive && currentStep === TOUR_STEPS.INCORRECT_ANSWERS}
  onNext={handleTourNext}
  onPrev={handleTourPrev}
  onSkip={skipTour}
  onClose={() => {}}
  title="Wrong Answers"
  content="Review questions you got wrong to learn from your mistakes and improve!"
  stepNumber={TOUR_STEPS.INCORRECT_ANSWERS + 1}
  totalSteps={TOTAL_TOUR_STEPS}
  placement="bottom"
>
  {/* Your wrong answers section UI */}
</TourTooltip>

{/* Saved Questions Section */}
<TourTooltip
  visible={tourActive && currentStep === TOUR_STEPS.SAVED_QUESTIONS}
  onNext={handleTourNext}
  onPrev={handleTourPrev}
  onSkip={skipTour}
  onClose={() => {}}
  title="Saved Questions"
  content="Access all your saved questions in one place for quick review!"
  stepNumber={TOUR_STEPS.SAVED_QUESTIONS + 1}
  totalSteps={TOTAL_TOUR_STEPS}
  placement="bottom"
>
  {/* Your saved questions section UI */}
</TourTooltip>

{/* Exams Section */}
<TourTooltip
  visible={tourActive && currentStep === TOUR_STEPS.EXAMS}
  onNext={handleTourNext}
  onPrev={handleTourPrev}
  onSkip={skipTour}
  onClose={() => {}}
  title="Practice Exams"
  content="Take full-length practice exams to prepare for the real SAT Math test. Good luck! 🎯"
  stepNumber={TOUR_STEPS.EXAMS + 1}
  totalSteps={TOTAL_TOUR_STEPS}
  placement="bottom"
  isLastStep={true}
>
  {/* Your exams section UI */}
</TourTooltip>
```

## 🧪 Testing the Tour

### Reset tour to test:
```typescript
import * as SecureStore from 'expo-secure-store';

// In your component or settings page
const resetTour = async () => {
  await SecureStore.deleteItemAsync('tourCompleted');
  // Optionally set wantsGuide
  const answers = await SecureStore.getItemAsync('onboardingAnswers');
  if (answers) {
    const parsed = JSON.parse(answers);
    parsed.wantsGuide = true;
    await SecureStore.setItemAsync('onboardingAnswers', JSON.stringify(parsed));
  }
  // Restart app
};
```

### Add manual tour trigger in profile:
```typescript
import { useTour } from '@/context/TourContext';

// In your profile screen
const { startTour } = useTour();

<TouchableOpacity onPress={startTour}>
  <Text>Start App Tour</Text>
</TouchableOpacity>
```

## 📊 Tour Flow Summary:

1. **Index Page** → Study Plan tooltip
2. **Navigate to Course Tab** → Shows lessons tooltip
3. **Course Tab** → Shows quizzes tooltip
4. **Navigate to Numbers Quiz** → Shows answer, hint, restart, save tooltips
5. **Navigate to Tests Tab** → Shows wrong answers, saved, exams tooltips
6. **Tour Complete!** ✅

## 🎨 Customization:

### Change tooltip appearance:
Edit `components/Tour/TourTooltip.tsx` styles.

### Change tour delay:
Edit `context/TourContext.tsx`:
```typescript
setTimeout(() => {
  setTourActive(true);
}, 2000); // Change delay here
```

### Add more steps:
1. Update `TOTAL_TOUR_STEPS` in `constants/tourSteps.ts`
2. Add new step to `TOUR_STEPS` object
3. Add new step info to `getTourStepInfo()`
4. Add TourTooltip component where needed

That's it! Your complete tour implementation is ready! 🎉
