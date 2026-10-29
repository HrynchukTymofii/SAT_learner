# Tasks

Legend: `[x]` done · `[ ]` open · `[-]` won't fix / accepted

## Critical: security / money

- [x] 1. `/api/user/upgrade` grants PRO without verifying the purchase with RevenueCat. Same as PDR_ua: accepted for the app (the RevenueCat sync removes PRO without an active entitlement); the website session now checks RevenueCat every 10 minutes (`website/lib/revenuecat.ts`, `lib/auth.ts`). **Needs `REVENUECAT_SECRET_KEY`** (added to `website/.env.example`); without it the website falls back to `User.isPro`
- [x] 2. Apple sign-in trusted the email sent by the app (`website/app/api/auth/apple/route.ts`: `frontendEmail || payload.email`), so a valid Apple token plus someone else's email logged in as that person. Now uses only `payload.email` from the verified token. Same bug noted in PDR_ua `TASKS.md` (not fixed there)
- [x] 3. Account deletion fails for anyone with a `Purchase` or `UserMessage` (no cascade in the schema), after quiz results and lesson progress are already deleted (no transaction). Apple requires working account deletion. Fixed: one transaction that also deletes `Purchase` and `UserMessage` (`website/app/actions/user-actions.ts`)
- [x] 3b. Server actions in `website/app/actions/user-actions.ts` (`"use server"`) take `userId` as an argument, so a web client can call e.g. `deleteUserAccount` / `updateUserPoints` for any user id. Fixed: removed `"use server"` so internal DB helper functions are not exposed as public RPC endpoints; all API endpoints (`/api/user/course/lesson`, etc.) now strictly enforce session/Bearer auth.
- [-] 4. Android upload keystore, `app/.env`, `GoogleService-Info.plist` committed to git. Accepted: used by Expo, keystore will be replaced
- [x] 5. `/api/user/update-points` trusts any points value from the client. Now whole numbers 1–200 only (a full exam gives at most 44 + 20)
- [-] 6. `/api/user/change-data` changes the password without the current password. Not needed. Length check added (4+, same as register, also checked in Settings)
- [x] 7. Login responses said whether an email exists ("User not found" vs "Invalid password"). `/api/auth/login` now returns 401 "Invalid email or password" for both; the app shows one message. (Register still says "User already exists", which any sign-up form has to)

## Logout / auth

- [x] 8. Profile error screen is a dead end (no retry, no logout). An expired or invalid token leaves the user stuck on "Error loading profile". Now has "Try again" and "Log Out"; 401/404 logs out automatically
- [x] 9. Expired token isn't detected: `/api/user` returns "Invalid or expired token", but the app checks for "Unauthorized". `_layout.tsx` also doesn't pass `setToken`, so the token is never cleared. Fixed: `/api/user` uses `requireAuth`; the app checks `status` 401/404 and does a full logout
- [x] 10. JWT expires after 60 days with no refresh (ported the sliding refresh from PDR_ua: `/api/user` returns a new token once the current one is a day old)
- [x] 11. Logout navigates twice: the profile focus effect pushes `/login?returnUrl=/profile` on top of `handleLogout`'s `replace("/login")`; the error screen flashes in between. Fixed with a `loggingOutRef`; logged-out profile now shows a blurred locked page (PDR_ua style) instead of the loader/error
- [x] 12. Logout keeps the previous user's data: local SQLite progress, `onboardingAnswers`, offline queue (the next user uploads the previous user's queued answers and points). New `hooks/useLogout.ts`: tries to send the queue (3s max), then clears it, the user tables in SQLite, `paused_exam`, RevenueCat, token and user. `onboardingAnswers` and the study plan are device-level and stay
- [x] 13. A background sync that finishes after logout calls `setUser` and brings the user back without a token. Fixed with a session counter (`lib/session.ts`) checked before `setUser`
- [x] 14. Settings logout goes to `/`, profile logout goes to `/login`; settings shows "Account deleted" on every logout. Turned out Settings only calls it after account deletion, so it's renamed `handleAccountDeleted` and uses the shared logout
- [x] 15. `AuthProvider` has no `hydrated` flag: screens briefly see `token === null` on cold start. Added `hydrated`; profile waits for it. Other screens can use it when needed

## Subscriptions / payments

- [x] 16. PRO sync in `_layout.tsx` computes expiry by hand from `latestPurchaseDate` (wrong for trials, grace periods, refunds; monthly ignored if an expired yearly exists). Use `entitlements.active`
- [x] 17. PRO sync uses a stale `user` (closure from app start) and spreads it over fresh data; removes PRO when RevenueCat is on the anonymous user. Ported PDR_ua fix (fresh user, ref, `isAnonymous` check, uncached customer info); RevenueCat is now configured before the first sync
- [x] 18. Buying while logged out: charged, then `upgradeToPro(null)` fails → no PRO. Guests now get "Log in to activate PRO" → login; RevenueCat moves the purchase to the account and the sync grants PRO. Restore also shows an error when the upgrade fails
- [x] 19. `/api/user/upgrade` creates a new `Purchase` row every time the sync calls it. Worse in SAT: `Purchase` is unique per (userId, courseId), so every call after the first threw, and renewals / plan changes never reached the DB. Now reuses an active purchase or upserts
- [x] 20. RevenueCat `VERBOSE` logging in production; unused `expo-iap` dependency. Removed; VERBOSE only in `__DEV__`

## Other bugs

- [x] 21. `/api/user` doesn't return `needSync`, so the user data sync only runs when forced
- [x] 22. Offline queue: API errors are swallowed so nothing gets queued, runs twice at once, overwrites actions added while running, no retry limit. Ported PDR_ua queue (lock, ids, in order, 5 tries on 5xx, sent before downloading user data, 15s request timeout)
- [x] 22b. `PATCH /api/user/course/quiz` used `update()`, which threw when the quiz result didn't exist on the server (after a reset / first push). Now `upsert()` (same as PDR_ua)
- [x] 23. Android "Rate us" opens `com.hrynchuk.pdrtests` (the wrong app)
- [x] 24. Expo SDK 54 → 57 / RN 0.86 (same versions as PDR_ua), version 1.0.7 → 1.0.8. `@react-navigation/*` imports moved to `expo-router/react-navigation` / `expo-router/tabs`; removed `newArchEnabled`, `edgeToEdgeEnabled`, top-level `splash` and `notification` (the plugins cover them); reanimated babel plugin removed (babel-preset-expo adds worklets); `VideoView fullscreenOptions`; `absoluteFill`; `IconSymbol` type; ThemeContext handles the new `"unspecified"` color scheme. Removed unused `react-native-math-view` (old-architecture native code). `expo-doctor` 21/21, `tsc` clean, Android bundle exports
- [x] 25b. Conditional hooks that crash: `tests/wrong/[quizId]` returned before its hooks when `token` is null (crash on logout while open); lesson screen called `useVideoPlayer` only for video lessons; `TobBlur`
- [ ] 25c. Optional. `npm run lint` shows 102 errors from the React Compiler rules that came with SDK 57's `eslint-config-expo` (`react-hooks/refs` 55, `no-unescaped-entities` 17, `set-state-in-effect` 16, `immutability` 15). They are lint rules, not TypeScript or runtime errors, so the editor doesn't show them and the app runs fine. The real ones (conditional hooks) are fixed in 25b; the rest only matter if the React Compiler gets enabled
- [ ] 25d. Test on device: logout/login, purchase + restore (sandbox), expired token, offline quiz → back online, account deletion (Tim)

## Code health

- [x] 26. Remove commented-out code (`payment.tsx`, `lib/user.ts`, upgrade route). `loginOld.tsx` removed (it was still a live `/loginOld` route). Fixed: removed all dead commented code blocks in `payment.tsx`, `lib/user.ts`, and `upgrade/route.ts`.
- [x] 26b. Fix `/api/user/stats` crash caused by invalid query `db.quizResult.fields.score`.
- [x] 26c. Enforce auth check in `/api/user/course/lesson` (previously accepted arbitrary `userId`).
- [ ] 27. Replace copy-pasted JWT checks in API routes with `requireAuth` (done for `/api/user`)

## Content: server → app question sync (explore only, not implemented)

**Goal:** when I edit or add questions on the server, installed apps pick up the changes without a new release.

### What exists today and why it doesn't work

- `loadUserInBackground` → `checkAppNeedSync()` (`GET /api/apps`, a global `Apps.needSync` flag) → `handleCheckForUpdates` → `POST /api/user/course/quiz/updates` with `{ quizId: localUpdatedAt }` → `applyAllQuizUpdatesLocally`.
- Problems:
  1. Only runs inside `forceSync || user.needSync`, and `/api/user` doesn't return `needSync` → in practice it only runs right after login.
  2. `applyAllQuizUpdatesLocally` only **inserts new** questions. Changed questions are never updated. That's the main gap.
  3. The server compares `Quiz.updatedAt` only. Editing a `QuizQuestion` bumps the question's `@updatedAt`, not the quiz's, so question-only edits are never sent.
  4. Only quiz IDs the device already has are sent, so new quizzes never arrive.
  5. Deleted or unpublished questions stay on the device forever.
  6. Needs a login; logged-out users never get updates.
  7. `Apps.needSync` is one global flag that nothing resets. It says "something changed", not what or when.

### Proposed design

1. **Server: one public endpoint** `GET /api/content/changes?since=<ISO timestamp>`
   - Returns published quizzes where `quiz.updatedAt > since` **or** any question `updatedAt > since`, plus questions changed since `since` (full rows), plus `deletedQuestionIds` / `deletedQuizIds`.
   - Also returns `serverTime`; the client saves this (not its own clock) as the next `since`.
   - No auth needed (content is the same for everyone). Cache for a few minutes.
   - Deletes need a record: add `deletedAt` (soft delete) to `Quiz` / `QuizQuestion`, or a small `ContentTombstone { id, type, deletedAt }` table.
2. **Cheap "anything new?" check:** replace the `Apps.needSync` boolean with `Apps.contentUpdatedAt` (set automatically whenever a quiz/question is saved in the admin, or by a manual "Publish content" button). The app calls `GET /api/apps` first and only fetches changes when `contentUpdatedAt > lastContentSync`.
3. **App: a `meta` table** (or `PRAGMA user_version` + SecureStore) with `lastContentSync`. For a fresh install, set it to the date the bundled DB was built.
4. **App: apply changes in one transaction**
   - `INSERT ... ON CONFLICT(id) DO UPDATE` for quizzes and questions (updates changed ones, inserts new ones).
   - Keep `localImagePath` / `localHintImagePath` when the image URL didn't change; clear them when it did, so `offlineImages` downloads the new image.
   - Delete rows in `deletedQuestionIds`. User tables (`user_quiz_questions`, `quiz_results`) must not cascade-delete progress unexpectedly; check the FK setup first (PDR_ua turns `foreign_keys` off for the same reason).
   - Save `serverTime` as `lastContentSync` only after the commit, so a failed apply retries next time.
5. **When to run:** app start and when the app returns to the foreground, throttled (for example at most every 6 hours), plus right after my trigger (step 2). Doesn't depend on login.
6. **Bundled DB:** also port PDR_ua's `contentUpdate.ts` (refresh content tables from the bundled DB on `CONTENT_DB_VERSION` bump) so big content releases shipped with the app also reach existing installs; then the delta sync only covers edits made after that release.
7. Later, the same pattern can cover `chapters` / `lessons` / `lesson_sections`.

## Quiz screen port (from PDR_ua)

- [x] 28. `TestsPage.tsx` (1,209 lines) replaced by `components/quiz/` (QuizScreen, useQuizSession, useQuizPersistence, useLeaveGuard, quizLogic), same split as PDR_ua. Saves are queued and idempotent (finish + back no longer saves or awards points twice), actions read state from a ref (no stale state in the back listener / exam timer). SAT UI components kept (HTML questions, grid-in, 70-min exam, SAT score)
- [x] 29. Non-PRO users could never finish a topic quiz from the last question: `goToNext` opened a paywall modal that is commented out, so nothing happened and results never showed
- [x] 30. Grid-in answers compared as exact strings: "0.5", ".5", "1/2" were wrong if the key said "1/2". Now compared as numbers (app screen, local DB score, wrong-answers list)
- [x] 31. "All wrong answers" saved to a quiz with id `all` that doesn't exist ("Quiz not found"); now each answer is merged into its own quiz's result. Its title was Ukrainian ("Усі неправильні відповіді")
- [x] 32. Exam "Finish Exam" label used a hardcoded 5 instead of the question count; exam points are now given only for a finished exam (leaving early still saves progress); explanation hidden during the exam

## Website course pages (found 2026-10-28)

- [x] 33. `/course` redirect for logged-in users builds `/course/${course.id}/...` (course id instead of chapter id): the lesson opens with an unknown chapter, so prev/next navigation is empty. Fully finished users go to `/course/<id>/completed`, a route that doesn't exist (404) Fixed: `/course` no longer redirects; logged-in users see the course with progress and a "Continue learning" button to the first unfinished item (correct chapter URL, lessons and quizzes in position order)
- [x] 34. `/course` and `[chapterId]/layout.tsx` both `redirect("/course")` when the course isn't found: infinite redirect loop if `COURSE_ID` is missing/wrong. Layout also calls `react-hot-toast` in a server component Fixed: `notFound()` instead of redirecting to `/course`; toast removed
- [x] 35. Logged-out visitors: clicking a lesson (even ones marked FREE) goes to `/course/...`, the layout redirects back to `/course`, the page just reloads. FREE badges promise access that doesn't exist; no login modal is shown Fixed: logged-out clicks open the login dialog
- [ ] 36. Lesson and quiz pages don't check `isPublished`, `isFree`/PRO, or that the item belongs to `chapterId`. Any logged-in user can open every paid lesson and quiz by URL; quiz answers are sent to the browser
- [x] 37. Web quiz double-awards points: every answer PATCHes (adds the score difference), then finishing POSTs, which adds the full quiz score again. Reset + redo farms points the same way (POST always adds `totalScore`) Fixed: POST gives only the score gained since the saved result (same as PATCH). Reset + redo can still re-earn points
- [x] 38. Web quiz grid-in: checked case-insensitively while playing but with exact match in the final results and on the server, so a grid-in answer can show "Correct" and then count as wrong. Pass mark is 70% on the web, 90% in the app Fixed: shared `website/lib/answers.ts` (same check as the app) in the web quiz and the quiz API; web pass mark 90% like the app
- [x] 39. `/api/user/course/next-page` takes `userId` from the request body without auth (reads anyone's progress) Fixed: user comes from the session / Bearer token
- [ ] 40. Course landing shows invented social proof: hardcoded 4 stars, "(128 reviews)", "Certificate of completion" (no certificate exists), price "Free" while PRO is paid
- [ ] 41. Course video embed uses `courseVideoUrl.split("v=")[1]`: breaks on `youtu.be/...` links and keeps `&t=...` params. Fallback image `/placeholder.svg` is not in `public/`
- [ ] 42. Course page lists all lessons, then all quizzes, so the "next item" order ignores `position` when lessons and quizzes are interleaved (lesson/quiz pages do sort by position)
- [ ] 43. App: `RateAppModal.tsx` is unused and entirely in Ukrainian (copied from PDR); delete or translate
- [x] 44. Rating prompt ported from PDR_ua (`lib/ratePrompt.ts`, `components/modals/RatePromptSheet.tsx`, mounted in the root layout): asks after an exam with 70%+ or a topic test answered to the end, waits 14 days after "Not now", stops after 2 dismissals, never again once rated. 4-5 stars → store review, 1-3 → feedback to support. Profile "Rate us" opens the same sheet

## Website split: marketing site + learning platform (2026-10-28)

- [x] 45. One Next.js project, two hosts (`middleware.ts`): `satlearner.com` = marketing (`app/(main)`: home, /info, /sat-course, privacy, terms), `app.satlearner.com` = platform (`app/learn`: home, /courses/[id], /course/..., /tests, /test, /planner, /dashboard, /profile, /login, /register). Old platform URLs on the main host redirect to the app host. Platform has its own plain layout (`components/platform/platform-shell.tsx`) and requires login
- [x] 46. Courses no longer hardcoded for the platform: `PLATFORM_COURSE_IDS` lists them (defaults to `COURSE_ID`), the chapter decides the course on lesson/quiz pages, platform home lists courses with progress, `/courses/[courseId]` is the course overview
- [ ] 47. Deploy: add `app.satlearner.com` to the Vercel project + DNS; set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, `AUTH_COOKIE_DOMAIN`, `NEXTAUTH_URL=https://app.satlearner.com`; add `https://app.satlearner.com/api/auth/callback/google` (and Apple) to the OAuth clients. The mobile app keeps calling `satlearner.com/api` (unchanged)
- [ ] 48. Still single-course: `/tests` and `/tests/exam` pages, `/api/course`, `/api/user/course`, `/api/user/course/chapters`, `/api/user/upgrade` (mobile app) read `COURSE_ID`. PRO is `User.isPro`, so it already covers every course; `upgrade` only also writes a Purchase row for COURSE_ID
- [ ] 49. Platform pages (dashboard, tests, planner, profile, lesson, quiz) keep their old marketing-style design inside the new shell; redesign once a design is picked
- [ ] 50. Database is missing the Planner tables (`StudyPlan`, `StudyTask`, `UserSettings`): /planner crashes. Run `website/sql/2026-10-28_add_planner_tables.sql` in the Neon SQL editor (see `DEPLOY_STEPS.md`). Never `prisma db push` this DB: it would drop tables the schema doesn't list (Account, AppEvent, ...)
- [x] 51. `/api/user/upgrade` used `upsert` on (userId, courseId), but the DB has no such unique index, so the upsert threw and `isPro` was never set. Now update-by-id / create
- [ ] 52. 373 duplicate Purchase rows (84 users): run `website/sql/2026-10-28_dedupe_purchases.sql` after a Neon backup branch
