# Handover checklist

Everything SAT Learner runs on, who owns it, and how to move it to the new owner. Work top to bottom:
the order avoids downtime (images, logins and payments keep working during the move).

Legend: ✅ done · ⬜ to do · **(new owner)** = she does it in her account

## 0. Before you start

- ⬜ **New owner creates her accounts** (all with an email she controls): GitHub, Vercel, Neon, Cloudflare ✅,
  Google (Cloud/Firebase), Apple Developer Program (paid, Account Holder), Google Play Console (paid),
  Expo, RevenueCat.
- ⬜ **(new owner)** Apple: accept the **Paid Apps agreement** and fill in banking + tax in App Store Connect.
  Google Play: set up a **payments profile**. Transfers with subscriptions fail without these.
- ⬜ Delete the Neon backup branches `before-cleanup` and `before-drop-unused` (the first one still holds other
  projects' users and data).

## 1. Code — GitHub

- ⬜ The repo `HrynchukTymofii/SAT_learner` is **public**. Make it **private** now (Settings → General →
  Danger Zone → Change visibility). An Android keystore and `.env` were committed in the past; they're removed
  from the current files but still in git history.
- ⬜ Transfer it: Settings → Danger Zone → **Transfer ownership** → her GitHub username. (Or she creates an empty
  private repo and you push to it.)
- ⬜ Hand over separately (zip via Google Drive etc., never git): see "Files that aren't in git" below.

## 2. Website hosting — Vercel

- ⬜ Vercel → the SAT project → Settings → General → **Transfer Project** → her team. Environment variables,
  domains, cron and deployments move with it. Then connect it to the transferred GitHub repo
  (Settings → Git).
- ⬜ After the move, check Settings → Environment Variables are all there, then **Redeploy**.
- ⬜ Update `ADMIN_EMAILS` to her email(s) and make her admin in the DB (`docs/admin-panel.md`), remove yours.

## 3. Database — Neon

Option A (recommended, nothing changes for the site): Neon → the SAT project → Settings → **Transfer project**
to an organization she owns (she creates an org and invites you as a member first). Connection strings stay the same.

Option B (copy): she creates a Neon project (**Postgres 18**, region US East 2 / Ohio to stay near Vercel), then
`pg_dump` / `pg_restore` with the **unpooled** URLs (`docs/database.md`, needs PostgreSQL 18 client tools).
Then put her `DATABASE_URL` + `DATABASE_URL_UNPOOLED` in Vercel → Redeploy → check the site → delete your project.

- ⬜ After either option: **reset the database role password** (Neon → Roles) so the old URL stops working,
  update Vercel env vars, redeploy.
- The old shared database (`ep-dark-dream-…`, other projects) stays yours; it's not part of the handover.

## 4. Media — Cloudflare R2 + DNS + domain

Question images and lesson videos are served from `https://media.satlearner.com` (R2 bucket `sat-media`).
The R2 custom domain only works when the bucket and the `satlearner.com` DNS zone are in the **same**
Cloudflare account.

- ✅ R2 bucket moved to her Cloudflare account.
- ⬜ **(new owner)** Cloudflare → Add a domain → `satlearner.com` → import records (the zone export is in
  `docs/cloudflare/` on the old PC, not in git) or recreate them: see `docs/deployment.md` → DNS.
- ⬜ Change the nameservers at Hostinger to the two her Cloudflare account shows. Wait until her zone is
  "Active".
- ⬜ **(new owner)** R2 → `sat-media` → Settings → Custom Domains → connect `media.satlearner.com`.
  Check an image URL from the DB loads. Then remove the zone from your Cloudflare account.
- ⬜ Vercel env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` must be from **her** account
  (R2 → Manage API tokens) → Redeploy. Test an upload in `/admin`.
- ⬜ **Domain registration** (Hostinger): move `satlearner.com` to her Hostinger account (Hostinger supports
  moving a domain between accounts; or transfer to another registrar such as Cloudflare Registrar). Check the
  expiry date and auto-renew. If it expires, the website, the API **and the mobile app** all stop working.

## 5. Google Cloud + Firebase (Google login, Android push)

The app and site use Google OAuth clients (project number `329617813146`) and Firebase project
`sat-prep-469713` (Android push via FCM). They are probably the same Google Cloud project; check in the console.

- ⬜ console.cloud.google.com → that project → IAM & Admin → IAM → **Grant access** → her Google account →
  role **Owner**. She accepts the invite email. Same in Firebase → Project settings → Users and permissions.
  Nothing else changes: client IDs, `google-services.json` and keys keep working.
- ⬜ If a billing account is linked, she links hers (Billing → Change billing account).
- ⬜ OAuth consent screen: change the support email / developer contact to hers.
- ⬜ After she confirms access, remove yourself.
- ⬜ The support mailbox `satlearner.app@gmail.com` (shown on the website, `website/lib/site.ts`): hand over
  the Google account (change password + recovery email/phone to hers), or change the address in code.
  If this Gmail owns any of the services above, transferring it moves those too.

## 6. Expo (app builds, push)

- ⬜ expo.dev → project `sat-prep-app` → Settings → **Transfer project** to her Expo account. The project ID
  (`app.config.ts` → `extra.eas.projectId`) stays, so existing phones keep getting pushes, and stored
  credentials (Android keystore, FCM V1 key) go along.
- If transfer isn't possible: before anything else download credentials with `eas credentials` (Android →
  production → Keystore → Download). She runs `eas init` in `app/` (new project ID in `app.config.ts`),
  uploads the keystore and the FCM V1 key again (`docs/push-notifications.md`). Push tokens of the old project
  stop working until users install her first build.
- ⬜ **(new owner)** First build from her account: `eas build --platform all --profile production`.
  iOS certificates / provisioning / push key are created by EAS in **her** Apple team (only after step 7).

## 7. Apple App Store

- ⬜ App Store Connect → Apps → SAT Math Learner → App Information → **Transfer App** → her Team ID and the
  Apple ID of her Account Holder. She accepts within 60 days. Subscriptions, ratings and the bundle ID
  `com.hrynchuk.satprepapp` move with it (the ID can't be renamed). TestFlight builds are deleted.
- ⬜ **Sign in with Apple users.** Apple gives each user a different ID and "Hide My Email" address per
  developer team. 31 users signed up with a hidden `@privaterelay.appleid.com` email; after the transfer their
  next Apple login has a new email and creates an empty account. Options: (a) accept it (they can contact
  support to merge), or (b) Apple's user migration: **before** the transfer, request transfer identifiers
  (`https://appleid.apple.com/auth/usermigrationinfo` with your team's key), after it her team exchanges
  them and the DB emails get updated. (b) needs a small script; ask the agent to write it.
- ⬜ **(new owner)** Website "Sign in with Apple": create her own Services ID + Sign in with Apple key, set
  `APPLE_ID`, `APPLE_SECRET` (`website/scripts/generate-apple-secret.mjs`), and `APPLE_CLIENT_ID` stays the
  bundle ID. Then revoke your old key (`AuthKey_94FN2DBB7H`).
- ⬜ In-app purchase key / App Store Connect API key for RevenueCat: she creates new ones in her account
  (step 9).

## 8. Google Play

- ⬜ Play Console → (your account) → **Transfer apps** (Settings / Developer account → App transfers): enter her
  developer account ID and the transaction ID of her registration fee. Subscriptions and users move. Play App
  Signing key stays with Google, so updates keep working.
- ⬜ **Upload key**: the old `my-upload-key.keystore` was in the public repo. After the transfer she requests an
  **upload key reset** (Play Console → Test and release → App integrity → App signing → Request upload key
  reset) with a key EAS generates (`eas credentials`).
- ⬜ For `eas submit` and RevenueCat she creates a Google Cloud service account with Play Console access
  (RevenueCat's guide "Google Play service credentials").

## 9. RevenueCat (subscriptions)

- ⬜ RevenueCat → Project settings → Collaborators → invite her → **transfer ownership**. Customers,
  entitlements `PRO Monthly` / `PRO Yearly`, offerings and the public SDK keys in `app/app/_layout.tsx` stay the same.
- ⬜ After steps 7 and 8, in RevenueCat → the iOS and Android apps → replace the App Store Connect
  in-app purchase key / shared secret and the Google service account JSON with ones from her accounts.
- ⬜ `REVENUECAT_SECRET_KEY` on Vercel: create a new secret key, update Vercel, delete the old one.

## 10. After everything moved: rotate what you knew

She should replace secrets the previous owner had: Neon role password (step 3), R2 tokens (step 4),
`GOOGLE_CLIENT_SECRET` (Google Cloud → the Web client → reset secret), `REVENUECAT_SECRET_KEY`, `CRON_SECRET`,
`NOTIFICATIONS_ADMIN_KEY`. **Keep `JWT_SECRET` and `NEXTAUTH_SECRET`** unless she's fine with logging every user
out.

## Not needed anymore

UploadThing (all files copied to R2), Mux, Stripe, Clerk: nothing uses them. The Fibipals/PDR/LockIn projects
and the old shared database stay with the previous owner.

## Files that aren't in git

Give these as a private zip (Google Drive), not through GitHub:

| What | Where on the old PC | Needed? |
|---|---|---|
| `website/.env` | `website/.env` | Useful as reference; Vercel has the real values after the transfer |
| `app/.env` | `app/.env` | Yes for local dev (Google client IDs) |
| Android upload keystore | `app/my-upload-key.keystore` + its passwords | Only if Expo transfer fails; reset it anyway (step 8) |
| Video media | `videos/public/` (13 MB) | Yes to re-render videos; `videos/out/` (127 MB) = finished MP4s, optional |
| Store screenshots | `store-creatives/app-store/`, `google-play/` (60 MB) | Optional, can be re-rendered |
| Brand / raw images | `assets/` (icons, store images, problem images) | Yes, design sources |
| Cloudflare zone export | `docs/cloudflare/satlearner.com.zone` | For step 4 |

Do **not** hand over: `website/lib/AuthKey_94FN2DBB7H.p8` (your Apple key; she makes her own), `.claude/`.

## Final check (new owner)

- `satlearner.com` and `app.satlearner.com` load; log in with email, Google, Apple.
- An image in a quiz loads (`media.satlearner.com`); upload a picture in `/admin`.
- The app (store version) logs in, loads the course, PRO status correct, a test purchase works (sandbox).
- Send a test notification to yourself (`/admin/notifications` → One user).
- Neon, Vercel, Cloudflare, Apple, Google, Expo, RevenueCat dashboards all show her as owner.
