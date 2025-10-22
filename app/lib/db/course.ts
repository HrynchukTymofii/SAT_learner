import { useSQLiteContext } from "expo-sqlite";

interface CompletedLessonsRow {
  completedCount: number;
}

interface CompletedQuizzesRow {
  completedCount: number;
}

interface AverageScoreRow {
  avgScore: number;
}

interface ChapterRow {
  id: string;
  title: string;
  position: number;
}

export type CourseItem = {
  id: string;
  title: string;
  type: "lesson" | "quiz";
  chapterId: string;
  position: number;
  progress?: {
    id: string;
    completed: boolean;
  }[];
  results?: {
    id: string;
    score: number;
    completed: boolean;
    attemptCount: number;
  }[];
};

export type ChapterWithItems = {
  id: string;
  title: string;
  position: number;
  items: CourseItem[];
};

export function useCourseDatabase() {
  const db = useSQLiteContext();

  /**
   * Get all chapters with lessons and quizzes (no user progress).
   */
  async function getFullCourse(): Promise<{
    success: boolean;
    chapters?: ChapterWithItems[];
    error?: string;
  }> {
    try {
      // 1. Get all chapters
      const chapters = (await db.getAllAsync(
        `SELECT * FROM chapters WHERE isPublished = 1 ORDER BY position ASC`
      )) as ChapterRow[];

      const allChapters: ChapterWithItems[] = [];

      for (const chapter of chapters) {
        const chapterId = chapter.id;

        // 2. Get lessons for the chapter
        const lessons = (await db.getAllAsync(
          `
          SELECT *
          FROM lessons
          WHERE chapterId = ?
          ORDER BY position ASC
          `,
          [chapterId]
        )) as CourseItem[];

        const lessonItems: CourseItem[] = lessons.map((l) => ({
          id: l.id,
          title: l.title,
          type: "lesson",
          chapterId: l.chapterId,
          position: l.position,
          progress: [], // no progress info
        }));

        // 3. Get quizzes for the chapter
        const quizzes = (await db.getAllAsync(
          `
          SELECT *
          FROM quizzes
          WHERE chapterId = ?
          ORDER BY position ASC
          `,
          [chapterId]
        )) as CourseItem[];

        const quizItems: CourseItem[] = quizzes.map((q) => ({
          id: q.id,
          title: q.title,
          type: "quiz",
          chapterId: q.chapterId,
          position: q.position,
          results: [], // no result info
        }));

        // 4. Combine & sort
        const combinedItems = [...lessonItems, ...quizItems].sort(
          (a, b) => a.position - b.position
        );

        allChapters.push({
          id: chapter.id,
          title: chapter.title,
          position: chapter.position,
          items: combinedItems,
        });
      }

      return { success: true, chapters: allChapters };
    } catch (err) {
      console.error("❌ Failed to load course (no progress):", err);
      return { success: false, error: "Failed to fetch course" };
    }
  }

  
  
  /**
   * Get all chapters with lessons and quizzes,
   * both ordered by position, and including progress/results.
   */
  async function getFullCourseWithProgress(): Promise<{
    success: boolean;
    chapters?: ChapterWithItems[];
    error?: string;
  }> {
    try {
      // --- 1. Get all chapters ordered by position ---
      const chapters = (await db.getAllAsync(
        `SELECT * FROM chapters WHERE isPublished = 1 ORDER BY position ASC`
      )) as ChapterRow[];

      const allChapters: ChapterWithItems[] = [];

      for (const chapter of chapters) {
        const chapterId = chapter.id;

        // --- 2. Get lessons for the chapter ---
        const lessons = (await db.getAllAsync(
          `
          SELECT l.*, lp.id AS progressId, lp.completed
          FROM lessons l
          LEFT JOIN lesson_progress lp ON lp.lessonId = l.id
          WHERE l.chapterId = ?
          ORDER BY l.position ASC
          `,
          [chapterId]
        )) as (CourseItem & { progressId?: string; completed?: number })[];

        const lessonItems: CourseItem[] = lessons.map((l) => ({
          id: l.id,
          title: l.title,
          type: "lesson",
          chapterId: l.chapterId,
          position: l.position,
          progress: l.progressId
            ? [{ id: l.progressId, completed: !!l.completed }]
            : [],
        }));

        // --- 3. Get quizzes for the chapter ---
        const quizzes = (await db.getAllAsync(
          `
          SELECT q.*, qr.id AS resultId, qr.score, qr.completed, qr.attemptCount
          FROM quizzes q
          LEFT JOIN quiz_results qr ON qr.quizId = q.id
          WHERE q.chapterId = ?
          ORDER BY q.position ASC
          `,
          [chapterId]
        )) as (CourseItem & {
          resultId?: string;
          score?: number;
          completed?: number;
          attemptCount?: number;
        })[];

        const quizItems: CourseItem[] = quizzes.map((q) => ({
          id: q.id,
          title: q.title,
          type: "quiz",
          chapterId: q.chapterId,
          position: q.position,
          results: q.resultId
            ? [
                {
                  id: q.resultId,
                  score: q.score ?? 0,
                  completed: !!q.completed,
                  attemptCount: q.attemptCount ?? 0,
                },
              ]
            : [],
        }));

        // --- 4. Combine and sort by position ---
        const combinedItems = [...lessonItems, ...quizItems].sort(
          (a, b) => a.position - b.position
        );

        allChapters.push({
          id: chapter.id,
          title: chapter.title,
          position: chapter.position,
          items: combinedItems,
        });
      }

      return { success: true, chapters: allChapters };
    } catch (err) {
      console.error("❌ Failed to load full course:", err);
      return { success: false, error: "Failed to fetch course" };
    }
  }

  async function getCompletedLessonsCount() {
    try {
      const rows = await db.getAllAsync(
        `
        SELECT COUNT(*) as completedCount
        FROM lesson_progress
        WHERE completed = 1
        `
      ) as CompletedLessonsRow[];

      const count = rows?.[0]?.completedCount ?? 0;
      return { success: true, count };
    } catch (err) {
      console.error("❌ Failed to get completed lessons count:", err);
      return { success: false, error: "Failed to count completed lessons" };
    }
  }

  async function getCompletedQuizzesCount() {
    try {
      const rows = (await db.getAllAsync(
        `
        SELECT COUNT(*) as completedCount
        FROM quiz_results
        WHERE completed = 1
        `
      )) as CompletedQuizzesRow[];

      const count = rows?.[0]?.completedCount ?? 0;
      return { success: true, count };
    } catch (err) {
      console.error("❌ Failed to get completed quizzes count:", err);
      return { success: false, error: "Failed to count completed quizzes" };
    }
  }

  async function getAverageScoreByChapter(chapterId: string) {
    try {
      const rows = (await db.getAllAsync(
        `
        SELECT AVG(qr.score) as avgScore
        FROM quiz_results qr
        JOIN quizzes q ON qr.quizId = q.id
        JOIN chapters c ON q.chapterId = c.id
        WHERE q.chapterId = ?
          AND qr.completed = 1
          AND (c.isPublished = 0 OR c.isPublished = 0)
        `,
        [chapterId]
      )) as AverageScoreRow[];

      return { success: true, average: rows?.[0]?.avgScore ?? 0 };
    } catch (err) {
      console.error("❌ Failed to get average score for chapter:", err);
      return { success: false, error: "Failed to calculate average score" };
    }
  }

  async function hasPerfectScoreInPublishedChapters() {
    try {
      const rows = (await db.getAllAsync(
        `
        SELECT qr.score, q.maxScore
        FROM quiz_results qr
        JOIN quizzes q ON qr.quizId = q.id
        JOIN chapters c ON q.chapterId = c.id
        WHERE qr.completed = 1
          AND q.isPublished = 1
          AND c.isPublished = 1
        `
      )) as { score: number | null; maxScore: number | null }[];

      let hasPerfectScore = false;

      for (const row of rows) {
        const score = row.score ?? 0;
        const maxScore = row.maxScore ?? 0;
        if (maxScore > 0 && score / maxScore === 1) {
          hasPerfectScore = true;
          break;
        }
      }

      return { success: true, hasPerfectScore };
    } catch (err) {
      console.error("❌ Failed to check perfect score in published chapters:", err);
      return { success: false, error: "Failed to check perfect scores" };
    }
  }




  return { getCompletedLessonsCount, hasPerfectScoreInPublishedChapters, getCompletedQuizzesCount, getAverageScoreByChapter, getFullCourse, getFullCourseWithProgress }
}
