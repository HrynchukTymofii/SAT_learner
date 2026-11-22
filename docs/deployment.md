# Deploying

## Website (Vercel)

- Vercel project with **Root Directory = `website`**, framework Next.js. Every push to the production branch
  deploys; other branches get preview URLs.
- Domains on the project: `satlearner.com`, `www.satlearner.com`, `app.satlearner.com`.
- Environment variables: everything in `website/.env.example`, set for Production (and Preview if previews
  should work). They apply only to **new** deployments: change → Redeploy.
- Production values that must be exact:
  `NEXT_PUBLIC_SITE_URL=https://satlearner.com`, `NEXT_PUBLIC_APP_URL=https://app.satlearner.com`,
  `AUTH_COOKIE_DOMAIN=.satlearner.com`, `NEXTAUTH_URL=https://app.satlearner.com` (no trailing slash).
- Cron: `vercel.json` runs `/api/cron/r2-cleanup` every Monday 04:00 UTC (needs `CRON_SECRET`).
- Database changes: run `npx prisma migrate deploy` yourself before deploying code that needs them
  (`docs/database.md`). The build does not migrate.

## DNS (Cloudflare) and domain (Hostinger)

`satlearner.com` is registered at Hostinger; its nameservers point to Cloudflare, where the records live:

| Name | Type | Target |
|---|---|---|
| `@` | A | `216.198.79.1` (Vercel) |
| `www`, `app` | CNAME | the `…vercel-dns-017.com` value Vercel shows under Domains |
| `media` | R2 custom domain | bucket `sat-media` (R2 → bucket → Settings → Custom Domains) |

The R2 custom domain only works when the zone and the bucket are in the **same Cloudflare account**.

## Login providers (redirect URIs)

- Google Cloud → APIs & Services → Credentials → the **Web** client: JS origins `https://app.satlearner.com`,
  `https://satlearner.com`; redirect URI `https://app.satlearner.com/api/auth/callback/google`.
  The **iOS** and **Android** clients are used by the app (Android one is tied to the signing certificate SHA-1:
  Play Console → App integrity → App signing key certificate).
- Apple → Identifiers → the website **Services ID** → Configure: domains `app.satlearner.com`, return URL
  `https://app.satlearner.com/api/auth/callback/apple`. `APPLE_SECRET` expires every 6 months:
  `node website/scripts/generate-apple-secret.mjs …` and update Vercel.

## Mobile app (EAS)

```bash
npm i -g eas-cli
eas login
cd app
# bump "version" in app.config.ts (and package.json) for a store release; build numbers are automatic
eas build --platform all --profile production
eas submit --platform ios       # → App Store Connect (TestFlight), then submit for review there
eas submit --platform android   # → Google Play (needs a Play service account key, eas credentials)
```

- Credentials (Android keystore, iOS certificates, push keys, FCM V1 key) are stored on EAS:
  `eas credentials` to view, download or replace.
- The JS-only changes still need a store build: this project doesn't use EAS Update (OTA).
- After a release, old versions stay in use for months: the API must stay backward compatible.

## Checklist after a website deploy

- `satlearner.com` shows marketing; `satlearner.com/dashboard` redirects to `app.satlearner.com/dashboard`.
- Log in on `app.satlearner.com` (email, Google). Open a lesson, finish a quiz, open `/planner`.
- `/admin` loads for an admin. The mobile app still logs in and loads the course.
