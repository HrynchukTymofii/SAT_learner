# CLAUDE.md — guide for AI coding agents

Read this before changing anything. Human overview: `README.md`. Per-folder detail: `website/README.md`,
`app/README.md`, `videos/README.md`, `store-creatives/README.md`, `docs/*.md`.

## The system in one picture

```
             Neon Postgres (one DB)  ◄── Prisma ──  website/  (Next.js on Vercel)
                                                    ├─ satlearner.com        marketing   app/(main)
                                                    ├─ app.satlearner.com    platform    app/learn  (+ /admin course editor)
                                                    ├─ /api/*                REST API for the mobile app (JWT Bearer)
                                                    └─ /expo-course/*        lesson pages embedded in the app's WebView
                                                                 ▲
  app/ (Expo) ── axios → https://www.satlearner.com/api ─────────┘
  ├─ local SQLite (bundled assets/databases/satprep.db, refreshed by contentSync)
  ├─ RevenueCat for PRO subscriptions → POST /api/user/upgrade
  └─ Expo push (FCM / APNs) ← website/lib/notifications.ts

  Cloudflare R2 bucket `sat-media` at https://media.satlearner.com: all question images and lesson videos.
```

- **One course** lives in the DB (`COURSE_ID` env var). `PLATFORM_COURSE_IDS` allows more on the platform.
- **PRO** = `User.isPro`. Bought only in the app (RevenueCat); the website re-checks RevenueCat every 10 min
  (`website/lib/revenuecat.ts`). Course admins get PRO automatically.
- **Users** have `platform = 'SATecosystem'`. Logins: email+password, Google, Apple (website: NextAuth;
  app: own endpoints `/api/auth/{login,register,google,apple}` that return a 60-day JWT with sliding refresh).
- **Course content** is edited in `/admin` on the platform (TipTap rich text stored as JSON). The website
  renders it directly; the app gets it converted to HTML by `website/lib/app-content.ts` via
  `GET /api/user/course/content`, and stores it in SQLite (`app/lib/db/contentSync.ts`).

## Hard rules

1. **Never `prisma db push`, never `prisma migrate dev` against production, never `migrate reset`.**
   Schema changes: edit `website/prisma/schema.prisma` → `npx prisma migrate dev --name x` against a **Neon dev
   branch** → read the generated SQL (any `DROP` loses data) → commit → `npx prisma migrate deploy` on
   production. See `docs/database.md`.
2. **The app's API contract is frozen for old app versions.** Phones run old builds for months. Never rename or
   remove fields/routes under `website/app/api/` that the app uses; add new ones instead.
   The app calls `https://www.satlearner.com` (hardcoded in `app/lib/axios.ts`); `middleware.ts` must keep
   letting `/api` and `/expo-course` through on the main host.
3. **Content format stays in sync.** If the TipTap editor gets a new node type, add it to `tiptapToAppHtml` in
   `website/lib/app-content.ts` (the app shows HTML) and to the web renderer.
4. **Secrets never go in git**: `.env`, `*.p8`, `*.keystore`, `*.jks`, service-account JSON. The repo was
   public once; treat anything that was committed as leaked.
5. **App styling gotcha (NativeWind):** `Pressable style={({pressed}) => …}` silently loses its style on
   iOS/Android (fine on web). Use `Tap` from `app/components/ds` instead. Check real-device screenshots;
   Expo web cannot run this app (expo-sqlite worker error).
6. **Change only what was asked.** The design (lavender/butter/ink, see below) was chosen deliberately.

## Commands (run inside the folder)

| Where | Check before you finish | Run |
|---|---|---|
| `website/` | `npx tsc --noEmit` and `npx next build` | `npm run dev` |
| `app/` | `npx tsc --noEmit` and `npx expo export --platform android` (bundle builds) | `npx expo start` (dev build) |
| `videos/` | `npx tsc --noEmit` | `npm run dev` (Remotion Studio) |

DB inspection without touching data: `npx prisma migrate status`, `npx prisma studio`, or a read-only
`$queryRaw` script. Release the app: `eas build --platform all --profile production`, then `eas submit`
(`docs/deployment.md`).

## Where things are

**website/** (Next.js App Router, `@/` = `website/`)
- `middleware.ts` — host routing: `app.` host → rewrites to `app/learn/*`; main host → marketing, redirects
  platform paths to the app host; `/api`, `/expo-course` untouched.
- `app/(main)/` marketing pages · `app/learn/(app)/` platform pages (dashboard, course, tests, planner, profile,
  pricing, **admin**) · `app/learn/(auth)/` login/register · `app/(expo)/expo-course/` pages for the app WebView.
- `app/api/user/**` app + platform API (app auth: `requireAuth` in `lib/expo-auth.ts` checks the Bearer JWT; platform pages use the NextAuth
  session via `lib/getAuth.ts`. Many older routes still copy-paste the JWT check, see known issues)
  · `app/api/auth/**` app logins · `app/api/admin/**` uploads + notifications · `app/api/cron/r2-cleanup`
  weekly unused-file cleanup (Vercel Cron, `vercel.json`).
- `lib/` — `db.ts` Prisma client, `auth.ts` NextAuth config, `jwt.ts` app tokens, `admin.ts` who is admin
  (`ADMIN_EMAILS` + `role='admin'`), `r2.ts` uploads, `app-content.ts` TipTap→app HTML, `answers.ts` answer
  checking shared by web quiz + API, `revenuecat.ts`, `notifications.ts` Expo push, `course-outline.ts` cached
  outline for static pages.
- `components/` — `ui/` shadcn, `site/` marketing chrome, `platform/` platform shell, `admin/rich-editor.tsx`,
  `tiptap-*` editor building blocks (from the TipTap simple template).
- `prisma/schema.prisma` + `prisma/migrations/` — the database (22 tables).

**app/** (Expo Router, `@/` = `app/`)
- `app/` screens (file-based routes): `(tabs)/` Home, Course, Tests, Profile · `course/[chapterId]/…` lesson and
  quiz · `tests/…` exams, by-topic, wrong, saved, improve · `payment.tsx` paywall · `settings.tsx`,
  `notifications.tsx` inbox, `calendar/` study planner, `onboarding.tsx`, `login.tsx`/`register.tsx`/`auth.tsx`.
  `selling-onboarding.tsx` is unreachable (kept on purpose, has placeholder testimonials).
- `app/_layout.tsx` — providers, RevenueCat setup (public SDK keys here), PRO sync, push permission, content sync.
- `lib/db/` — SQLite: `fetchDb.ts` opens/copies the bundled DB, `contentSync.ts` server refresh, `course.ts`,
  `quiz.ts`, `question.ts`, `lesson.ts`, `offlineImages.ts` (bundled question images in `assets/offline/`).
- `lib/` — `axios.ts` API base, `user.ts` user sync, `offlineQueue.ts` queued writes when offline,
  `session.ts`, `useLogout` in `hooks/`, `inbox.ts` push token + inbox, `notifications.ts` local daily reminder,
  `achievements.ts`, `ratePrompt.ts`, `studyPlanStorage.ts`.
- `components/ds/` — the design-system kit (`Tap`, cards, `Sheet`, `Segmented`, `SwitchRow`, toasts);
  `components/quiz/` quiz engine (`QuizScreen`, `useQuizSession`, …); `constants/palette.ts` colours
  (`usePalette()`); `context/` Auth, Theme, Tour.
- `scripts/build-offline-db.ts` — rebuilds the bundled `satprep.db` from the server (see its README).

## Design language (2026 redesign)

Palette: lavender `#E4CDFF` / `#C9AAFB`, butter `#FEE7A6`, ink `#0B0A0F`, white; accents mint `#CDEFD9`,
rose `#FFD6DE`. Pastel cards keep dark ink text in both themes; graph-paper texture on pastels.
Fonts: Outfit (headings), Manrope (body). Approved mockups: `redesign-previews/v3/`.
Website tokens: `website/app/globals.css`. App: `app/constants/palette.ts`, kit in `app/components/ds/`.

## Gotchas

- Quiz answers: grid-in answers are compared as numbers (`0.5` = `.5` = `1/2`); logic in `website/lib/answers.ts`
  and `app/components/quiz/quizLogic.ts` — keep them identical.
- Points: `/api/user/update-points` only accepts 1–200; quiz POST/PATCH give only the score difference.
- Expo notifications: use `sound: true`, never `sound: "default"`.
- Nested expo-router stacks need `contentStyle` background or they flash white.
- Website `/` and `/sat-course` are statically cached (revalidate 1h); logged-in users are redirected to the platform.
- Open issues and ideas: `docs/known-issues.md`.
