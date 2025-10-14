import * as Crypto from "expo-crypto";
import { useSQLiteContext } from "expo-sqlite";

export function useLessonDatabase() {
  const db = useSQLiteContext();

  /**
   * Mark a lesson as completed locally
   */
  async function markLessonCompletedLocal(lessonId: string): Promise<boolean> {
    try {
      // Check if there is already a record for this lesson
      const existing = await db.getFirstAsync<{ completed: number }>(
        `SELECT completed FROM lesson_progress WHERE lessonId = ?`,
        [lessonId]
      );

      if (existing) {
        // Already exists: set completed = 1
        await db.runAsync(
          `UPDATE lesson_progress SET completed = 1, synced = 0 WHERE lessonId = ?`,
          [lessonId]
        );
      } else {
        // Doesn't exist: insert a new record
        const id = Crypto.randomUUID();
        await db.runAsync(
          `INSERT INTO lesson_progress (id, lessonId, completed, synced) VALUES (?, ?, 1, 0)`,
          [id, lessonId]
        );
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to mark lesson completed:", error);
      return false;
    }
  }

  return {markLessonCompletedLocal}
}
