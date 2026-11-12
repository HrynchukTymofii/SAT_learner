import type { SQLiteDatabase } from "expo-sqlite";
import api from "../axios";

/**
 * Keeps the local course content (chapters, lessons, quizzes, quiz_questions) in step with the
 * server, so edits made in the website's /admin reach the app without a new release.
 *
 * The bundled satprep.db is still the starting copy, so the app works on first launch offline.
 * On start and whenever the app comes back to the foreground we ask the server for its content
 * version; only when it differs is the full content downloaded and applied in one transaction.
 * The user's own tables (progress, results, saved questions) are never touched.
 */
const VERSION_KEY = "content_version";

type Row = Record<string, string | number | null>;
type Content = {
  version: string;
  unchanged?: boolean;
  chapters: Row[];
  lessons: Row[];
  quizzes: Row[];
  questions: Row[];
};

let running: Promise<boolean> | null = null;

/** Returns true when new content was applied. Safe to call often: runs once at a time. */
export function syncCourseContent(db: SQLiteDatabase): Promise<boolean> {
  running ??= run(db).finally(() => (running = null));
  return running;
}

async function run(db: SQLiteDatabase) {
  try {
    await db.execAsync(`CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT)`);
    const current = await db.getFirstAsync<{ value: string }>(`SELECT value FROM app_meta WHERE key = ?`, [VERSION_KEY]);

    const res = await api.get<Content>("/user/course/content", {
      params: current ? { since: current.value } : undefined,
      timeout: 30000,
    });
    const data = res.data;
    if (!data?.version || data.unchanged || data.version === current?.value) return false;
    // Never empty the course because of a bad or partial answer
    if (!data.chapters?.length || !data.quizzes?.length || !data.questions?.length) return false;

    await db.withTransactionAsync(async () => {
      await apply(db, data);
      await db.runAsync(`INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [
        VERSION_KEY,
        data.version,
      ]);
    });
    return true;
  } catch (err: any) {
    // Offline or server trouble: keep using the local copy
    console.warn("Course content sync skipped:", err?.message ?? err);
    return false;
  }
}

async function apply(db: SQLiteDatabase, c: Content) {
  for (const r of c.chapters) {
    await db.runAsync(
      `INSERT INTO chapters (id, title, description, videoUrl, youTubeVideoUrl, position, isPublished, isFree)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)
       ON CONFLICT(id) DO UPDATE SET title = excluded.title, description = excluded.description, videoUrl = excluded.videoUrl,
         youTubeVideoUrl = excluded.youTubeVideoUrl, position = excluded.position, isPublished = 1, isFree = excluded.isFree`,
      [r.id, r.title, r.description, r.videoUrl, r.youTubeVideoUrl, r.position, r.isFree],
    );
  }
  for (const r of c.lessons) {
    await db.runAsync(
      `INSERT INTO lessons (id, title, videoUrl, youTubeVideoUrl, description, position, isPublished, isFree, points, chapterId)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title = excluded.title, videoUrl = excluded.videoUrl, youTubeVideoUrl = excluded.youTubeVideoUrl,
         description = excluded.description, position = excluded.position, isPublished = 1, isFree = excluded.isFree,
         points = excluded.points, chapterId = excluded.chapterId`,
      [r.id, r.title, r.videoUrl, r.youTubeVideoUrl, r.description, r.position, r.isFree, r.points, r.chapterId],
    );
  }
  for (const r of c.quizzes) {
    await db.runAsync(
      `INSERT INTO quizzes (id, title, description, totalQuestions, position, isPublished, isFree, maxScore, chapterId, updatedAt)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title = excluded.title, description = excluded.description, totalQuestions = excluded.totalQuestions,
         position = excluded.position, isPublished = 1, isFree = excluded.isFree, maxScore = excluded.maxScore,
         chapterId = excluded.chapterId, updatedAt = excluded.updatedAt`,
      [r.id, r.title, r.description, r.totalQuestions, r.position, r.isFree, r.maxScore, r.chapterId, r.updatedAt],
    );
  }
  // Images bundled with the app (localImagePath) stay in use while the question is unchanged;
  // once it's edited, the image comes from its URL
  for (const r of c.questions) {
    await db.runAsync(
      `INSERT INTO quiz_questions (id, question, questionType, questionImageUrl, localImagePath, imageHeight, options, answers, hint,
         points, position, hintImageUrl, localHintImagePath, note, likes, dislikes, quizId, updatedAt)
       VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET question = excluded.question, questionType = excluded.questionType,
         localImagePath = CASE WHEN quiz_questions.updatedAt = excluded.updatedAt OR quiz_questions.questionImageUrl = excluded.questionImageUrl
           THEN quiz_questions.localImagePath ELSE '' END,
         localHintImagePath = CASE WHEN quiz_questions.updatedAt = excluded.updatedAt OR quiz_questions.hintImageUrl = excluded.hintImageUrl
           THEN quiz_questions.localHintImagePath ELSE '' END,
         questionImageUrl = excluded.questionImageUrl, imageHeight = excluded.imageHeight, options = excluded.options,
         answers = excluded.answers, hint = excluded.hint, points = excluded.points, position = excluded.position,
         hintImageUrl = excluded.hintImageUrl, note = excluded.note, likes = excluded.likes, dislikes = excluded.dislikes,
         quizId = excluded.quizId, updatedAt = excluded.updatedAt`,
      [r.id, r.question, r.questionType, r.questionImageUrl, r.imageHeight, r.options, r.answers, r.hint, r.points, r.position,
        r.hintImageUrl, r.note, r.likes, r.dislikes, r.quizId, r.updatedAt],
    );
  }

  // Remove what was deleted or unpublished on the server (children first)
  const ids = (rows: Row[]) => JSON.stringify(rows.map((r) => r.id));
  await db.runAsync(`DELETE FROM quiz_questions WHERE id NOT IN (SELECT value FROM json_each(?))`, [ids(c.questions)]);
  await db.runAsync(`DELETE FROM quizzes WHERE id NOT IN (SELECT value FROM json_each(?))`, [ids(c.quizzes)]);
  await db.runAsync(`DELETE FROM lessons WHERE id NOT IN (SELECT value FROM json_each(?))`, [ids(c.lessons)]);
  await db.runAsync(`DELETE FROM chapters WHERE id NOT IN (SELECT value FROM json_each(?))`, [ids(c.chapters)]);
}
