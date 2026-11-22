# Database and migrations

Postgres on Neon, accessed only through Prisma from `website/`. The app never connects to it directly.

- Schema: `website/prisma/schema.prisma` (22 tables). History: `website/prisma/migrations/`.
- Connection: `DATABASE_URL` (pooled, `-pooler` in the host; used by the running site) and
  `DATABASE_URL_UNPOOLED` (direct; used by Prisma Migrate). Neon → Connect shows both.

## Main tables

| Area | Tables |
|---|---|
| Users | `User` (`platform = 'SATecosystem'`, `isPro`, `role`, `points`, `league`), `UserSettings`, `UserMessage` (support messages from the app) |
| Course | `Course` → `Chapter` → `Lesson`, `Quiz` → `QuizQuestion`; `CourseEditor`, `CourseSubscription` |
| Progress | `LessonProgress`, `QuizResult`, `UserQuizQuestion` (saved / answered questions), `UserProgress` (per chapter), `Comment` |
| Money | `Purchase` (one per user+course; PRO itself is `User.isPro`) |
| Planner | `StudyPlan`, `StudyTask` |
| Push | `PushToken`, `Notification`, `NotificationRead` |
| App sync | `Apps` (one row "SAT prep"; legacy `needSync` flag) |

Question text, hints and explanations are TipTap JSON. Images and videos are URLs on `media.satlearner.com` (R2).

## Changing the schema

1. Neon → **Branches** → create a branch from production (e.g. `dev`). Put its **unpooled** URL in
   `website/.env` as both `DATABASE_URL` and `DATABASE_URL_UNPOOLED` (keep the production values aside).
2. Edit `schema.prisma`, then `npx prisma migrate dev --name what_changed`.
3. Read the new `prisma/migrations/<date>_what_changed/migration.sql`. `DROP TABLE`, `DROP COLUMN` and
   type changes delete data.
4. Commit the schema and the migration folder.
5. Production: Neon backup branch first, then with the production URLs `npx prisma migrate deploy`,
   and `npx prisma migrate status` → "up to date". Deploy the code that needs the change after that.

**Never** `prisma db push` or `prisma migrate reset` on production. Old app versions keep calling the API, so
prefer adding columns over renaming/removing them.

## Backups and restore

Neon keeps point-in-time history (length depends on the plan): Neon → Branches → Restore. Before anything
risky, create a branch (instant copy) and delete it a few days later.

Full copy to another Neon project or Postgres server (needs PostgreSQL client tools of the same major version,
Postgres 18 here):

```bash
pg_dump  -Fc --no-owner --no-acl "<source UNPOOLED url>" -f sat.dump
pg_restore --no-owner --no-acl -d "<target UNPOOLED url>" sat.dump
```

`_prisma_migrations` comes along, so `npx prisma migrate status` on the new DB says "up to date".

## History

- 2026-10-28: moved off a database shared with other projects (Fibipals, PDR, LockIn).
- 2026-10-29: removed other projects' users/courses and 10 foreign tables; deduplicated purchases.
- 2026-11-22: dropped 10 unused empty tables (Article, Category, Challenge, MuxData, StripeCustomer, ...).
- Images moved from UploadThing to Cloudflare R2 (`media.satlearner.com`); no `utfs.io` URLs remain.
