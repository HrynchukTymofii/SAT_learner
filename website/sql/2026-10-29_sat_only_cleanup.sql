-- Turns the copied database into a SAT-only one. Run it on the NEW database (ep-flat-water-b5gr6vex),
-- never on the old shared one (ep-dark-dream-a5lry5pk), which the other projects still use.
-- DELETES ROWS AND DROPS TABLES: make a Neon branch (backup) first.
--
-- Keeps: the SAT course (03b4e7b3-...), the "SAT prep" app row, all SATecosystem users and the
-- SAT course editors (2 Fibipals accounts). Deletes the other projects' courses, users and data,
-- and drops the 10 tables the SAT code doesn't use.
--
-- Dry run on 2026-10-29: users 10541 -> 3723, courses 5 -> 1, QuizResult 22374 -> 6655,
-- LessonProgress 4644 -> 2881, Purchase 734 -> 44. SAT's own rows were all kept.

-- 1. Preview: what will be deleted
SELECT 'users to delete' AS what, COUNT(*) FROM "User" u
WHERE u.platform <> 'SATecosystem'
  AND u."userId" NOT IN (SELECT "userId" FROM "CourseEditor" WHERE "courseId" = '03b4e7b3-a05c-4fad-a166-7923861b7716')
UNION ALL
SELECT 'courses to delete', COUNT(*) FROM "Course" WHERE id <> '03b4e7b3-a05c-4fad-a166-7923861b7716'
UNION ALL
SELECT 'users kept', COUNT(*) FROM "User" u
WHERE u.platform = 'SATecosystem'
   OR u."userId" IN (SELECT "userId" FROM "CourseEditor" WHERE "courseId" = '03b4e7b3-a05c-4fad-a166-7923861b7716');

-- 2. Delete (from BEGIN to COMMIT)
BEGIN;

-- Users we keep: SAT accounts + the editors of the SAT course
CREATE TEMP TABLE keep_users ON COMMIT DROP AS
  SELECT "userId" FROM "User" WHERE platform = 'SATecosystem'
  UNION
  SELECT "userId" FROM "CourseEditor" WHERE "courseId" = '03b4e7b3-a05c-4fad-a166-7923861b7716';

-- Tables the SAT code never uses (not in website/prisma/schema.prisma)
DROP TABLE "UserSavedSubcomponents", "Subcomponent", "Component", "CommentReaction",
           "Account", "VerificationToken", "AppEvent", "AppUpload", "Error", "YouTubeComment";
-- Enums only those tables used
DROP TYPE "Platform", "CommentReactionType";

-- Other projects' courses. RESTRICT children first, the rest cascades
-- (chapters, lessons, quizzes, questions, their results, progress, purchases, comments)
DELETE FROM "CourseCategory"     WHERE "courseId" <> '03b4e7b3-a05c-4fad-a166-7923861b7716';
DELETE FROM "CourseEditor"       WHERE "courseId" <> '03b4e7b3-a05c-4fad-a166-7923861b7716';
DELETE FROM "CourseSubscription" WHERE "courseId" <> '03b4e7b3-a05c-4fad-a166-7923861b7716';
DELETE FROM "UserQuizQuestion" WHERE "questionId" IN (
  SELECT qq.id FROM "QuizQuestion" qq
  JOIN "Quiz" q ON q.id = qq."quizId"
  JOIN "Chapter" ch ON ch.id = q."chapterId"
  WHERE ch."courseId" <> '03b4e7b3-a05c-4fad-a166-7923861b7716');
DELETE FROM "Course" WHERE id <> '03b4e7b3-a05c-4fad-a166-7923861b7716';
DELETE FROM "Category";
DELETE FROM "Article";                 -- web-dev articles; sections cascade
DELETE FROM "Apps" WHERE id <> '3b29ad03-9b43-49c7-b53f-4ab02767eaae';

-- Users of other platforms, and rows of users that no longer exist
DELETE FROM "Purchase"           p WHERE NOT EXISTS (SELECT 1 FROM keep_users k WHERE k."userId" = p."userId");
DELETE FROM "UserMessage"        m WHERE NOT EXISTS (SELECT 1 FROM keep_users k WHERE k."userId" = m."userId");
DELETE FROM "UserQuizQuestion"   u WHERE NOT EXISTS (SELECT 1 FROM keep_users k WHERE k."userId" = u."userId");
DELETE FROM "CourseSubscription" s WHERE NOT EXISTS (SELECT 1 FROM keep_users k WHERE k."userId" = s."userId");
DELETE FROM "QuizResult"         r WHERE NOT EXISTS (SELECT 1 FROM keep_users k WHERE k."userId" = r."userId");
DELETE FROM "LessonProgress"     l WHERE NOT EXISTS (SELECT 1 FROM keep_users k WHERE k."userId" = l."userId");
DELETE FROM "User"               u WHERE NOT EXISTS (SELECT 1 FROM keep_users k WHERE k."userId" = u."userId");

COMMIT;

-- 3. Check: should be SATecosystem ~3721 and Fibipals 2
SELECT platform, COUNT(*) FROM "User" GROUP BY platform;
