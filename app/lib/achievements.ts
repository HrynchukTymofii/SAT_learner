import {
  Award,
  BookMarked,
  BookOpen,
  Brain,
  CalendarCheck,
  Crown,
  Flame,
  GraduationCap,
  LucideIcon,
  Medal,
  Rocket,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react-native";
import type { PastelName } from "@/constants/palette";
import type { AchievementStats } from "@/lib/db/course";

export type AchievementGroup = "Learning" | "Practice" | "Exams" | "Habits";

export interface Achievement {
  id: string;
  group: AchievementGroup;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: PastelName;
  /** where the user is now and what unlocks it */
  current: number;
  target: number;
  unlocked: boolean;
}

/** Every achievement is earned from real progress stored on the phone (plus total points). */
export function buildAchievements(s: AchievementStats, points: number): Achievement[] {
  const a = (
    id: string,
    group: AchievementGroup,
    title: string,
    description: string,
    icon: LucideIcon,
    tone: PastelName,
    current: number,
    target: number
  ): Achievement => ({ id, group, title, description, icon, tone, current: Math.min(current, target), target, unlocked: current >= target });

  return [
    // Learning
    a("lesson-1", "Learning", "First steps", "Finish your first lesson", BookOpen, "mint", s.lessons, 1),
    a("lesson-10", "Learning", "Getting going", "Finish 10 lessons", BookOpen, "mint", s.lessons, 10),
    a("lesson-30", "Learning", "Bookworm", "Finish 30 lessons", GraduationCap, "mint", s.lessons, 30),
    a("lesson-60", "Learning", "Theory pro", "Finish 60 lessons", GraduationCap, "mint", s.lessons, 60),
    a("chapter-1", "Learning", "Chapter closed", "Finish every lesson and quiz in a chapter", Medal, "lav", s.chaptersDone, 1),
    a("chapter-5", "Learning", "Halfway hero", "Finish 5 whole chapters", Award, "lav", s.chaptersDone, 5),

    // Practice
    a("quiz-1", "Practice", "First quiz", "Finish a topic quiz", Zap, "butter", s.quizzes, 1),
    a("quiz-10", "Practice", "Math master", "Finish 10 topic quizzes", Brain, "butter", s.quizzes, 10),
    a("quiz-25", "Practice", "Quiz machine", "Finish 25 topic quizzes", Brain, "butter", s.quizzes, 25),
    a("perfect-1", "Practice", "Perfect practice", "Get 100% on a quiz", Star, "rose", s.perfectQuizzes, 1),
    a("perfect-5", "Practice", "Flawless five", "Get 100% on 5 different quizzes", Sparkles, "rose", s.perfectQuizzes, 5),
    a("retake-1", "Practice", "Comeback", "Retake a quiz and beat your first score", TrendingUp, "lav2", s.improvedRetakes, 1),
    a("saved-5", "Practice", "Collector", "Save 5 questions to review later", BookMarked, "lav2", s.savedQuestions, 5),

    // Exams
    a("exam-1", "Exams", "Exam day", "Finish a full practice exam", Timer, "lav", s.exams, 1),
    a("exam-3", "Exams", "Test runner", "Finish 3 practice exams", Rocket, "lav", s.exams, 3),
    a("exam-600", "Exams", "On the rise", "Score 600+ on a practice exam", Target, "butter", s.bestExam, 600),
    a("exam-700", "Exams", "High scorer", "Score 700+ on a practice exam", Trophy, "butter", s.bestExam, 700),
    a("exam-800", "Exams", "Perfect 800", "Score 800 on a practice exam", Crown, "butter", s.bestExam, 800),

    // Habits
    a("streak-3", "Habits", "On a roll", "Study 3 days in a row", Flame, "rose", s.longestStreak, 3),
    a("streak-7", "Habits", "Week streak", "Study 7 days in a row", Flame, "rose", s.longestStreak, 7),
    a("days-30", "Habits", "Regular", "Study on 30 different days", CalendarCheck, "mint", s.activeDays, 30),
    a("points-1000", "Habits", "Point collector", "Earn 1,000 points", Sparkles, "lav2", points, 1000),
  ];
}
