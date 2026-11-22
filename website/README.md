# website/ — Next.js site, learning platform and API

One Next.js 15 (App Router) project deployed on Vercel. It serves three things:

| Host / path | What | Code |
|---|---|---|
| `satlearner.com` | Marketing: home, `/sat-course`, `/info/*` articles, privacy, terms | `app/(main)/` |
| `app.satlearner.com` | Learning platform (login required): home, course, lessons, quizzes, tests & exams, planner, stats dashboard, profile, `/admin` course editor | `app/learn/` |
| `satlearner.com/api/*` | REST API used by the mobile app (and the platform) | `app/api/` |
| `satlearner.com/expo-course/*` | Lesson/question pages the app shows in a WebView | `app/(expo)/` |

`middleware.ts` decides which is which by host name (the `app.` host is rewritten to `app/learn/*`).
Platform links are written without `/learn` (e.g. `/tests`).

## Run locally

```bash
cp .env.example .env    # every variable is explained in the file
npm install             # runs prisma generate
npm run dev             # http://localhost:3000 (marketing), http://app.localhost:3000 (platform)
```

Leave `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL` and `AUTH_COOKIE_DOMAIN` empty locally.
Use a **Neon dev branch** URL in `.env` if you will write data; the production URL works but it's real data.

Minimum to boot: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `COURSE_ID`, `NEXTAUTH_SECRET`, `JWT_SECRET`.
Google/Apple login, R2 uploads, RevenueCat and push each need their own block of variables.

Before pushing: `npx tsc --noEmit` and `npx next build`.

## Folder map

```
app/
  (main)/              marketing pages (home is static, revalidated hourly)
  learn/(auth)/        login, register
  learn/(app)/         platform: page.tsx home, course/, courses/[id], tests/, test/, planner/, dashboard/,
                       profile/, pricing/, admin/ (chapters, lessons, quizzes, questions, notifications)
  (expo)/expo-course/  pages embedded in the mobile app
  api/auth/            app logins: login, register, google, apple; [...nextauth] for the website
  api/user/            user, course progress, quizzes, saved/wrong questions, stats, planner, push token,
                       notifications inbox, subscription/upgrade, content sync (course/content)
  api/admin/           upload (presigned R2 URLs), notifications (send push)
  api/cron/r2-cleanup  weekly: deletes R2 files no longer referenced (vercel.json)
  actions/             server-side helpers (not exposed as server actions)
components/
  ui/                  shadcn/ui primitives
  site/, home/         marketing header/footer/sections
  platform/            platform shell, skeletons, course cards, admin preview toggle
  admin/rich-editor.tsx  TipTap editor used in /admin
  tiptap-*/            TipTap building blocks (nodes, toolbar, icons); readonly-editor renders lessons
lib/                   see CLAUDE.md "Where things are"
prisma/                schema.prisma + migrations/ (Prisma Migrate)
scripts/               generate-apple-secret.mjs (APPLE_SECRET, every 6 months)
```

## Auth

- Website: NextAuth (`lib/auth.ts`) with credentials, Google and Apple. Session cookie shared across
  `satlearner.com` and `app.satlearner.com` through `AUTH_COOKIE_DOMAIN`.
- App: `/api/auth/*` return a JWT signed with `JWT_SECRET` (60 days, refreshed by `/api/user`).
  Changing `JWT_SECRET` logs every app user out.
- Admins: email in `ADMIN_EMAILS` **and** `User.role = 'admin'` (`lib/admin.ts`). See `../docs/admin-panel.md`.

## Database

Prisma + Neon Postgres. Read `../docs/database.md` before any schema change. Never `prisma db push`.
