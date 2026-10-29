-- Removes duplicate Purchase rows and adds the (userId, courseId) unique index from the schema.
-- On 2026-10-28 there were 373 extra rows in 84 (user, course) pairs, created by the old
-- /api/user/upgrade, which inserted a new row on every app sync.
-- DELETES ROWS: make a Neon branch (backup) first.
-- Keeps one row per pair: a lifetime one (no endAt) first, then the latest endAt, then the newest.

-- 1. Preview: how many rows will be deleted
SELECT COUNT(*) AS rows_to_delete FROM (
  SELECT ROW_NUMBER() OVER (
    PARTITION BY "userId", "courseId"
    ORDER BY ("endAt" IS NULL) DESC, "endAt" DESC NULLS LAST, "updatedAt" DESC
  ) AS rn
  FROM "Purchase"
) r WHERE r.rn > 1;

-- 2. Delete the duplicates and add the unique index
BEGIN;

DELETE FROM "Purchase" p
USING (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY "userId", "courseId"
    ORDER BY ("endAt" IS NULL) DESC, "endAt" DESC NULLS LAST, "updatedAt" DESC
  ) AS rn
  FROM "Purchase"
) r
WHERE p.id = r.id AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "Purchase_userId_courseId_key" ON "Purchase"("userId", "courseId");

COMMIT;
