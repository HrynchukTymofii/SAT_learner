# Known issues and ideas

Open items carried over from the previous owner's task list (2026-11). Fixed items are in git history
(`tasks.md` before 2026-11-22).

## Bugs / security

- **Lesson and quiz pages on the platform don't check access.** `app/learn/(app)/course/[chapterId]/…` doesn't
  check `isPublished`, `isFree` / PRO, or that the item belongs to the chapter. Any logged-in user can open paid
  lessons and quizzes by URL, and quiz answers are sent to the browser.
- **Web quiz: reset + redo earns points again.**
- **`/api/user/upgrade` trusts the app** (grants PRO without asking RevenueCat). Accepted because the app's
  RevenueCat sync removes PRO without an active entitlement and the website re-checks every 10 min
  (`REVENUECAT_SECRET_KEY` must be set for that).
- **`/api/user/change-data`** changes the password without the current one.
- Older API routes copy-paste the JWT check instead of `requireAuth` (`website/lib/expo-auth.ts`). Move them over
  when you touch them.

## Website

- Course landing shows invented social proof (4 stars, "(128 reviews)", "Certificate of completion") and price
  "Free" while PRO is paid. Remove or make real.
- Course video embed uses `courseVideoUrl.split("v=")[1]`: breaks on `youtu.be/…` links; fallback
  `/placeholder.svg` is missing from `public/`.
- Course page lists all lessons, then all quizzes, so "next item" ignores `position` when they're interleaved.
- Still single-course in places: `/tests`, `/tests/exam`, `/api/course`, `/api/user/course*`, `/api/user/upgrade`
  read `COURSE_ID`.
- Inner platform pages (tests, quiz, lesson, planner, stats) were recoloured by script and never reviewed
  logged-in after the redesign. Do a visual pass with a test account.

## App

- `pnpm lint` reports ~100 React Compiler rule errors (refs, set-state-in-effect, …) from SDK 57's lint
  config. Not runtime errors; only matter if the React Compiler is enabled.
- Needs a device test pass: logout/login, purchase + restore (sandbox), expired token, offline quiz → back
  online, account deletion.
- `selling-onboarding.tsx` is unreachable and contains placeholder testimonials/stats: delete or make real
  before linking it.
- Store builds before the content-sync release (1.0.8 and older) don't receive `/admin` edits.

## Ideas

- Replace the global `Apps.needSync` flag with a `contentUpdatedAt` timestamp so the app can skip the content
  request when nothing changed.
- "SAT Scroll" feed (theory → problem → short video), teased in `videos/` (`promo-sat-scroll`).
