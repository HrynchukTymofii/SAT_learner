# SAT Learner

SAT Math prep: a website with a learning platform, and an iOS/Android app. Both read the same course
(chapters → lessons + quizzes → questions) from one Postgres database.

| Part | Folder | Tech | Live at |
|---|---|---|---|
| Marketing site + learning platform + **the API the app uses** | [`website/`](website/README.md) | Next.js 15, Prisma, Postgres (Neon), NextAuth, Vercel | `satlearner.com`, `app.satlearner.com` |
| Mobile app | [`app/`](app/README.md) | Expo SDK 57, React Native, expo-router, SQLite, RevenueCat | App Store "SAT Math Learner", Google Play `com.hrynchuk.satprepapp` |
| Promo and lesson videos | [`videos/`](videos/README.md) | Remotion (React → MP4), Edge TTS | — |
| App Store / Google Play screenshots | [`store-creatives/`](store-creatives/README.md) | HTML + Playwright | — |
| Design mockups (reference only) | [`redesign-previews/`](redesign-previews/README.md) | static HTML | — |
| Brand source images | [`assets/`](assets/README.md) | — | — |
| How-to guides | [`docs/`](docs/) | — | — |

## Start here

- **Taking over the project?** → [`HANDOVER.md`](HANDOVER.md): every account and service to transfer, in order.
- **Working with an AI agent (Claude Code)?** → [`CLAUDE.md`](CLAUDE.md) is loaded automatically: architecture, rules, commands.
- **Guides:** [database & migrations](docs/database.md) · [deploying](docs/deployment.md) ·
  [admin panel / editing the course](docs/admin-panel.md) · [push notifications](docs/push-notifications.md) ·
  [known issues / ideas](docs/known-issues.md)

## Run it locally (short version)

Needs Node 20+ and git. Each folder has its own `package.json`; there is no root workspace.

```bash
# Website + API (http://localhost:3000 = marketing, http://app.localhost:3000 = platform)
cd website
cp .env.example .env      # fill in at least DATABASE_URL, DATABASE_URL_UNPOOLED, COURSE_ID, NEXTAUTH_SECRET, JWT_SECRET
npm install               # also runs `prisma generate`
npm run dev

# Mobile app (needs a development build, not Expo Go: native modules)
cd app
cp .env.example .env      # Google client IDs
npm install
npx expo start            # then press a / i, or open the dev build on a phone
```

The app always talks to the **production** API (`https://www.satlearner.com`, `app/lib/axios.ts`).
Details and the full env var list are in each folder's README.

## What is NOT in git (hand over separately)

`.env` files, the Android upload keystore, Apple `.p8` keys, `videos/public/` (voice, music, images),
`videos/out/` (renders), rendered store screenshots, raw images in `assets/`. See [`HANDOVER.md`](HANDOVER.md).
