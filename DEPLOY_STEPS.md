# What to do: database fixes + app.satlearner.com

Do the steps in this order. Steps 1–3 clean up the new SAT database and fix crashes that are live
today; steps 4–8 switch on the new learning platform at `app.satlearner.com`.

Checked on 2026-10-28:
- DNS for satlearner.com is hosted at **Hostinger** (nameservers `ns1/ns2.dns-parking.com`).
- `www.satlearner.com` is a CNAME to Vercel (`b596f3d0440f34de.vercel-dns-017.com`), `satlearner.com` is an A record to Vercel (`216.198.79.1`).

## Database move (done 2026-10-28)

SAT used to share one database with the other projects (PDR, LockIn, Fibipals). It now has its own:

| | Neon endpoint | Database | Postgres |
|---|---|---|---|
| **New, SAT only (live)** | `ep-flat-water-b5gr6vex` | `neondb` | 18 |
| Old, shared | `ep-dark-dream-a5lry5pk` | `lms` | 16 |

- Copied with Neon **Import data** into a new project, import branch set as default.
  Row counts of all 36 tables matched the old database.
- `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` on Vercel and in `website/.env` point to the new one; redeployed and tested.
- The mobile app only talks to `satlearner.com/api`, so it needed no change.
- **Leave the old database alone.** The other projects still run on it, and it's the SAT backup for the next 1–2 weeks.
  Don't delete SAT rows from it until the new one has run fine for a while.
- The new database is still a full copy of everything: step 1 removes what isn't SAT's.

> **Never run `npx prisma db push` on either database, and never `migrate dev` on production.** The old one
> holds tables the website schema doesn't know about (`Account`, `AppEvent`, `AppUpload`, `Component`, `Error`,
> `YouTubeComment`, ...), and `db push` would delete them. The new one now uses Prisma Migrate
> (`prisma migrate deploy`, see "Database migrations" near the end).

---

## 1. Remove the other projects' data from the new database — ✅ done 2026-10-29

`website/sql/2026-10-29_sat_only_cleanup.sql`. Run it **only on the new database** (`ep-flat-water-b5gr6vex`).

What it keeps: the SAT course (`COURSE_ID` = `03b4e7b3-…`), the "SAT prep" row in `Apps`, all
`SATecosystem` users, and the 2 editors of the SAT course (`Fibipals` accounts `tim.20049090@…`
and `skotsiubynska@…`). Everything else goes:

| | Before | After |
|---|---|---|
| Users | 10,541 | 3,723 |
| Courses | 5 | 1 |
| Chapters / Lessons | 77 / 93 | 22 / 21 |
| Quizzes / Questions | 138 / 3,370 | 53 / 830 |
| QuizResult | 22,374 | 6,655 |
| LessonProgress | 4,644 | 2,881 |
| Purchase | 734 | 44 |
| UserQuizQuestion | 6,053 | 619 |
| Apps, Articles, Categories, Challenges | other projects / test data | only "SAT prep" left |

It also **drops 10 tables** the SAT code doesn't use: `Account`, `AppEvent`, `AppUpload`, `Component`,
`Subcomponent`, `UserSavedSubcomponents`, `CommentReaction`, `Error`, `VerificationToken`, `YouTubeComment`.

A dry run (rolled back) on 2026-10-29 gave exactly these numbers. All of SAT's own rows were kept, and no
user of another platform had SAT activity.

1. Make a backup: Neon → the **new** project → **Branches** → **Create branch** (from the default branch,
   name it `before-cleanup`).
2. **SQL Editor** on the default branch: run part **1. Preview**. Expect `users to delete` 6818,
   `courses to delete` 4, `users kept` 3723 (a bit more if people signed up since).
3. Run part **2** (from `BEGIN;` to `COMMIT;`), then part **3**: expect `SATecosystem` ~3721 and `Fibipals` 2.
4. Check the site and the app: log in, open the course, take a quiz, Pro status.
5. If something is wrong, Neon can restore the default branch from `before-cleanup`. Once all is fine for a few days, delete the backup branch.

## 2. Remove duplicate purchases — ✅ done 2026-10-29 (34 deleted, unique index added)

The database has duplicate Purchase rows from an old bug in `/api/user/upgrade`. There were 373 on the
shared database; **after step 1, 34 are left** (all SAT's own: 44 rows, 10 real purchases).
The code no longer depends on this (fixed 2026-10-28), but the duplicates make purchase data hard to read
and the database is missing the "one purchase per user per course" rule.

1. Do step 1 first, and make a backup branch again (or reuse `before-cleanup` if you do both in one go).
2. SQL Editor on the default branch: run only part **1. Preview** from `website/sql/2026-10-28_dedupe_purchases.sql`.
   It should say 34.
3. Run part **2** (from `BEGIN;` to `COMMIT;`).
4. When you're sure everything is fine, delete the backup branch.

## 3. Create the Planner tables (fixes the /planner crash) — ✅ done 2026-10-29 (migrations applied)

Error you saw: `The table public.UserSettings does not exist in the current database.`
The Planner tables (`StudyPlan`, `StudyTask`, `UserSettings`) were added to the code but never
created in the database. This is now the first Prisma migration, so the database starts using
Prisma Migrate (see "Database migrations" below). Don't also run `website/sql/2026-10-28_add_planner_tables.sql`;
it does the same thing by hand.

Run in PowerShell, in `website/` (uses `DATABASE_URL_UNPOOLED` from `.env`, which is the new database):

1. Tell Prisma the existing tables are already there. This only writes one row to the `_prisma_migrations`
   table and changes nothing else:
   ```
   npx prisma migrate resolve --applied 0_init
   ```
2. Check: `npx prisma migrate status` should say 1 migration not yet applied: `20261029000000_add_planner_tables`.
3. Create the tables (only `CREATE TABLE` / `CREATE INDEX`, nothing is deleted):
   ```
   npx prisma migrate deploy
   ```
4. `npx prisma migrate status` → "Database schema is up to date!"
5. Commit `website/prisma/schema.prisma` and `website/prisma/migrations/`, deploy, and open `/planner`; it should load.

## 4. Add app.satlearner.com to Vercel

1. [vercel.com](https://vercel.com) → the SAT website project → **Settings** → **Domains**.
2. **Add** → type `app.satlearner.com` → choose **Connect to an environment: Production** → **Add**.
3. Vercel shows "Invalid Configuration" and the DNS record it wants, something like:

   | Type  | Name | Value |
   |-------|------|-------|
   | CNAME | app  | `xxxxxxxx.vercel-dns-017.com` |

   Copy that exact value. (It's probably the same as the `www` one, `b596f3d0440f34de.vercel-dns-017.com`,
   but use whatever Vercel shows.)

## 5. Add the DNS record at Hostinger

1. [hpanel.hostinger.com](https://hpanel.hostinger.com) → **Domains** → `satlearner.com` → **DNS / Nameservers** → **DNS records**.
2. Under **Manage DNS records**, fill in:
   - **Type:** `CNAME`
   - **Name:** `app` (just `app`, not `app.satlearner.com`; Hostinger adds the domain itself)
   - **Points to / Target:** the value from Vercel (step 4)
   - **TTL:** leave the default
3. Click **Add Record**.
4. If there is already an `app` record (A or CNAME), delete it first; one name can't have both.
5. Wait. Usually 5–30 minutes, at most a few hours. Vercel's Domains page turns green ("Valid
   Configuration") and creates the HTTPS certificate by itself.

Check from your computer (PowerShell):
```
nslookup app.satlearner.com
```
It should answer with a `vercel-dns` name. Then open https://app.satlearner.com; until step 8 is done it may not work fully.

## 6. Environment variables on Vercel

Vercel → project → **Settings** → **Environment Variables** → for **Production** add or change:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://satlearner.com` |
| `NEXT_PUBLIC_APP_URL` | `https://app.satlearner.com` |
| `AUTH_COOKIE_DOMAIN` | `.satlearner.com` (with the dot: shares the login between both sites) |
| `NEXTAUTH_URL` | `https://app.satlearner.com` (change it: login now lives on the platform) |
| `PLATFORM_COURSE_IDS` | optional; the course ids shown on the platform, comma separated. Empty = `COURSE_ID` |

If the site normally uses `www.satlearner.com` instead of `satlearner.com`, use the `www` address in `NEXT_PUBLIC_SITE_URL`.

## 7. Login providers

Keep the existing satlearner.com entries; only add the new ones.

**Google:** [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → **Credentials** → the **Web** OAuth client →
- Authorized JavaScript origins: add `https://app.satlearner.com`
- Authorized redirect URIs: add `https://app.satlearner.com/api/auth/callback/google`
- **Save** (takes a few minutes to apply).

**Apple** (only if "Sign in with Apple" is used on the website): [developer.apple.com](https://developer.apple.com) → Certificates, Identifiers & Profiles → **Identifiers** → filter **Services IDs** → the website's Services ID → **Configure** →
- Domains: add `app.satlearner.com`
- Return URLs: add `https://app.satlearner.com/api/auth/callback/apple`
- **Next** → **Done** → **Continue** → **Save**.

The mobile app is not affected: it keeps using `satlearner.com/api`.

## 8. Deploy and check

1. Commit and push (or **Redeploy** in Vercel after changing env variables; they only apply to new deployments).
2. Check:
   - [ ] https://satlearner.com shows the marketing home page
   - [ ] https://satlearner.com/dashboard redirects to https://app.satlearner.com/dashboard
   - [ ] https://app.satlearner.com asks you to log in; log in with email, then with Google
   - [ ] After logging in on the app, go back to satlearner.com: the navbar shows you as logged in
   - [ ] Home shows the course with progress; **Continue** opens the right lesson
   - [ ] Open a lesson, mark it complete, take a quiz
   - [ ] `/planner` loads (step 3)
   - [ ] Log out from the app sidebar

If login loops or says "callback URL mismatch", check step 7 and that `NEXTAUTH_URL` is exactly `https://app.satlearner.com` (no trailing slash).

## Database migrations (from now on)

Since 2026-10-29 `website/prisma/schema.prisma` matches the new database exactly (the columns the parent
project had added are in it now: `User.role`, `QuizQuestion.openEndedAnswer/likes/dislikes`,
`Comment.isApproved/isPinned/editedAt`, `Apps.version`). `prisma/migrations/0_init` is the database as it
was after the cleanup; every change after that is a new folder in `prisma/migrations/`.

To change the database:
1. Neon → **Branches** → create a dev branch (e.g. `dev`) and put its **unpooled** URL into
   `DATABASE_URL` and `DATABASE_URL_UNPOOLED` in your local `website/.env`. Never point `migrate dev` at production.
2. Edit `schema.prisma`, then `npx prisma migrate dev --name what_changed`. It creates
   `prisma/migrations/<date>_what_changed/migration.sql` and applies it to the dev branch.
3. Read that `migration.sql`. Any `DROP` or `ALTER ... DROP COLUMN` deletes data; make sure you mean it.
4. Commit the schema and the new migration folder.
5. Production: `npx prisma migrate deploy` with the production URL, before or right after deploying the code.
   (Or let Vercel do it: `"build": "prisma migrate deploy && next build"` in `website/package.json`.)

Still never use `prisma db push` on production. And the parent project, which now also edits SAT content in
this database, must never run `db push`/`migrate` against it: its schema still has the dropped tables.

## Local development

No env changes needed. Run `npm run dev` in `website/` and open:
- http://localhost:3000 — marketing site
- http://app.localhost:3000 — platform (Chrome and Edge open `*.localhost` without any setup)

Leave `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL` and `AUTH_COOKIE_DOMAIN` empty in `website/.env`.

## Notes

- `REVENUECAT_SECRET_KEY is not set; skipping PRO check` in the logs is a warning, not a crash. Without the key,
  the website trusts `User.isPro` instead of asking RevenueCat. To turn the check on, add the secret key from
  RevenueCat → Project settings → API keys (the **secret** one, starts with `sk_`) as `REVENUECAT_SECRET_KEY` on Vercel.
- Open bugs and follow-ups are in `tasks.md` (#47–49).

### After the database move
- **Change the old database password.** The full connection string of `ep-dark-dream-a5lry5pk` (role
  `tim.20049090`) was visible in a screenshot. Neon → old project → **Roles** → reset the password, then update
  the env vars of the other projects that use it.
- **Backups from this PC:** the new database is Postgres 18, but the installed client tools are 16
  (`C:\Program Files\PostgreSQL\16\bin`). `pg_dump` 16 refuses a newer server, so install the PostgreSQL 18
  client first. Use the **unpooled** URL (no `-pooler`) for `pg_dump`/`psql`.
- **Old shared database:** once SAT has run on the new one for 1–2 weeks, you can delete the SAT rows from it
  (on a backup branch first; its tables are shared with the other projects).

### Mobile app: expired login (60 days) blocks the profile page
In the App Store build (1.0.8) the profile page shows "Error loading profile" when the token is older than
60 days, and the only Log out button is behind that page. Reinstalling doesn't help: iOS keeps the token in
the Keychain after the app is deleted, and there is no way to clear one app's Keychain data on an iPhone.

- **Workaround for one phone:** in Safari type `satprepapp://login` → **Open**. Logging in replaces the old token.
- **Real fix** (already in the working copy, not released yet): the profile page and the background load
  (`app/lib/user.ts`) log out on 401/404, and `/api/user` sends a fresh token once a day
  (`website/lib/jwt.ts`), so active users never hit 60 days. Needs a new store build (bump `version` in
  `app/app.config.ts` to 1.0.9). Until then every user with an expired token gets stuck.
