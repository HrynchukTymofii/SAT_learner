// Global tour steps configuration
export const TOUR_STEPS = {
  // Index/Explore page (Study Plan)
  STUDY_PLAN: 0,

  // Course page
  COURSE_TAB: 1,
  LESSONS_SECTION: 2,
  ENTER_QUIZ: 3,

  // Quiz page (First quiz in Numbers chapter)
  USE_HINT: 4,
  // RESTART_TEST: 5,
  SAVE_QUESTION: 5,

  // Tests page
  INCORRECT_ANSWERS: 6,
  EXAMS: 7,
};

export const TOTAL_TOUR_STEPS = 8;

export const getTourStepInfo = (step: number) => {
  const steps = {
    [TOUR_STEPS.STUDY_PLAN]: {
      title: "Study Plan 📅",
      content: "Create and manage your daily study tasks here. Set goals and track your progress!",
      page: "index",
    },
    [TOUR_STEPS.COURSE_TAB]: {
      title: "Course 📚",
      content: "Choose a math topic to start learning!",
      page: "course",
    },
    [TOUR_STEPS.LESSONS_SECTION]: {
      title: "Lessons 📖",
      content: "First, explore the lesson to recap your knowledge and learn new concepts!",
      page: "course",
    },
    [TOUR_STEPS.ENTER_QUIZ]: {
      title: "Take a Quiz ✏️",
      content: "Then try a quiz! Tap on any quiz to start practicing what you've learned.",
      page: "course",
    },
    [TOUR_STEPS.USE_HINT]: {
      title: "Get Hints 💡",
      content: "Stuck? Tap the hint button to get helpful guidance without revealing the answer!",
      page: "quiz",
    },
    [TOUR_STEPS.SAVE_QUESTION]: {
      title: "Save Questions 🔖",
      content: "Save important questions to review later. Find them in the Tests tab under 'Saved'!",
      page: "quiz",
    },
    [TOUR_STEPS.INCORRECT_ANSWERS]: {
      title: "Wrong Answers ❌",
      content: "Review questions you got wrong to learn from your mistakes and improve!",
      page: "tests",
    },
    [TOUR_STEPS.EXAMS]: {
      title: "Practice Exams 🎯",
      content: "Take full-length practice exams to prepare for the real SAT Math test. Good luck!",
      page: "tests",
    },
  };

  return steps[step] || null;
};
