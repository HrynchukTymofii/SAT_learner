# app/ — SAT Math Learner (Expo / React Native)

iOS + Android app. Bundle ID / package: `com.hrynchuk.satprepapp` (can't be changed after release).
Expo SDK 57, React Native 0.86, expo-router, NativeWind, expo-sqlite, RevenueCat, Expo push.

## Features

- **Course**: chapters → lessons (text in a WebView of `satlearner.com/expo-course/...`, optional video from R2)
  and topic quizzes. Progress, points and leagues.
- **Tests**: full exams (70 min timer, SAT-style score), by topic, wrong answers, saved questions, "improve".
- **Planner** (`calendar/`), daily study reminder, achievements (22 badges), onboarding + guided tour.
- **PRO** subscription via RevenueCat (`payment.tsx`); logged-out buyers are asked to log in to activate.
- **Inbox + push notifications** sent from the website admin (`docs/push-notifications.md`).
- **Update prompt**: on start the app compares its version with `GET /api/app-version` (`lib/version.ts`,
  `components/modals/UpdateRequiredModal.tsx`). The required version is `Apps.version` of the "SAT prep" row:
  after a new store release, set it with `UPDATE "Apps" SET version = '1.0.9' WHERE name = 'SAT prep';`.
- **Works offline**: course content lives in local SQLite; answers made offline are queued and sent later.

## How content gets to the phone

1. The build ships `assets/databases/satprep.db` (chapters, lessons, quizzes, questions) and question images in
   `assets/offline/`.
2. On start and when returning to foreground, `lib/db/contentSync.ts` calls
   `GET /api/user/course/content?since=<version>` and upserts changes, so edits in the website `/admin` reach
   installed apps without a new release.
3. To refresh the bundled snapshot before a big release: `npx ts-node scripts/build-offline-db.ts`, then copy
   `offline-build/satprep.db` over `assets/databases/satprep.db` (see `scripts/README-LESSON-RENDERING.md`).

User data (progress, results, saved questions) is in SQLite too and synced with the server via `lib/user.ts`
and `lib/offlineQueue.ts`. Logout (`hooks/useLogout.ts`) clears it.

## Run locally

```bash
cp .env.example .env       # Google OAuth client IDs (see comments in the file)
pnpm install
npx expo start
```

The app uses native modules (Google Sign-In, RevenueCat, SQLite), so it needs a **development build**, not
Expo Go: `eas build --profile development --platform android` (or ios) once, install it, then `npx expo start`.
Expo web does not work (expo-sqlite worker error).

The app always calls the production API, `https://www.satlearner.com` (`lib/axios.ts`).

Checks: `npx tsc --noEmit` and `npx expo export --platform android` (the JS bundle builds).

## Hardcoded values to know about

| What | Where |
|---|---|
| API base URL | `lib/axios.ts`, lesson WebView URL in `app/course/[chapterId]/lesson/[lessonId]/index.tsx` |
| RevenueCat public SDK keys (`appl_…`, `goog_…`) | `app/_layout.tsx` |
| Google OAuth client IDs (also in `.env`) | `app/auth.tsx`, `app/login.tsx`, `app/(tabs)/course/index.tsx`, `iosUrlScheme` in `app.config.ts` |
| Firebase (Android push) | `google-services.json`; iOS `GoogleService-Info.plist` |
| EAS project ID | `app.config.ts` → `extra.eas.projectId` |

## Release

`eas build --platform all --profile production` then `eas submit --platform ios|android`.
Version: bump `version` in `app.config.ts` and `package.json`; build numbers auto-increment on EAS.
Signing credentials are stored on EAS (`eas credentials`). Full steps: `../docs/deployment.md`.

## Folder map

```
app/            screens (expo-router; (tabs)/ = bottom tabs)
components/ds/  design-system kit — use Tap instead of Pressable(style fn), see ../CLAUDE.md
components/     quiz/ (quiz engine), tests/, achievements/, art/ (SVG illustrations), modals/, Tour/,
                info/ (SAT info articles), TP components/ (quiz header, options, results card...), ui/
constants/      palette.ts (colours), tourSteps.ts
context/        AuthContext (token, user, hydrated), ThemeContext, TourContext
hooks/          useLogout, useAppleLogin, useColorScheme
lib/            api calls, SQLite (db/), sync, notifications, achievements, rate prompt
scripts/        build-offline-db.ts + render-lesson-html.ts (bundled DB builder)
assets/         images, fonts, KaTeX css, databases/satprep.db, offline/ (question images)
web-preview-shims/  stand-ins for native modules on web (unused while Expo web is broken)
```
