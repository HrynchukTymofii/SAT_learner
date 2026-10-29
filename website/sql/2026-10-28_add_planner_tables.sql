-- Creates the tables the Planner needs (StudyPlan, StudyTask, UserSettings).
-- They are in prisma/schema.prisma but were never created in the database, so /planner crashes:
--   "The table public.UserSettings does not exist in the current database."
-- Only adds things; safe to run twice. Do NOT use `prisma db push` on this database:
-- it would also DROP tables that the schema doesn't know about (Account, AppEvent, ...).

BEGIN;

CREATE TABLE IF NOT EXISTS "StudyPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudyTask" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "targetId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudyTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "satDate" TIMESTAMP(3),
    "reminderTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StudyPlan_userId_idx" ON "StudyPlan"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "StudyPlan_userId_date_key" ON "StudyPlan"("userId", "date");
CREATE INDEX IF NOT EXISTS "StudyTask_planId_idx" ON "StudyTask"("planId");
CREATE UNIQUE INDEX IF NOT EXISTS "UserSettings_userId_key" ON "UserSettings"("userId");

DO $$ BEGIN
  ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_planId_fkey"
    FOREIGN KEY ("planId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;
