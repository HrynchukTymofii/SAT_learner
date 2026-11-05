# Push notifications and the inbox

How messages get from the website to students' phones, how to send one, and what has to be set up once.

## How it works

1. **The phone registers.** When the app starts, it asks for notification permission (`app/app/_layout.tsx`). If the student allows it, the app gets an Expo push token (an address for that phone) and sends it to `POST /api/user/push-token` (`app/lib/inbox.ts`). The token is stored in the `PushToken` table, linked to the account while someone is logged in. On logout the link is removed (`app/hooks/useLogout.ts`), but the phone keeps getting messages sent to everyone.
2. **You write a message** on the admin page. It is saved in the `Notification` table. That table is the inbox behind the bell on the app's Home screen.
3. **The server sends it** (`website/lib/notifications.ts`). It picks the phones for the chosen audience and sends to Expo's push service in batches of 100. Expo forwards to Google (FCM) for Android and Apple (APNs) for iPhone.
4. **Tapping it opens the app** on the message's link (for example `/tests/exams`) or on the inbox. Tokens Expo reports as dead (app uninstalled) are deleted automatically.

People who blocked notifications still see every message in the bell inbox the next time they open the app. Read state is stored per account (`NotificationRead` table), or on the phone when logged out.

## Sending a notification

Log in on the platform and open **app.satlearner.com/admin/notifications** (only users with `role = 'admin'`).

| Field | What it does |
| --- | --- |
| Title, Message | What people see (title up to 120 characters, message up to 1000) |
| Send to | Everyone, PRO users, Free users, or One user (by email) |
| Opens in the app | Optional screen path, e.g. `/tests/exams`, `/payment`, `/(tabs)/course`. Only in-app paths starting with `/` are accepted |
| Also send as a push notification | Untick to put it only in the inbox, without buzzing phones |

After sending, the page shows how many pushes Expo accepted. The history below shows how many people read each message.

**Testing:** install a build with notifications on your phone, allow notifications, log in, then send to **One user** with your own email.

### From a script

Set `NOTIFICATIONS_ADMIN_KEY` in the website's environment (24 or more random characters), then:

```bash
curl -X POST https://www.satlearner.com/api/admin/notifications \
  -H "Authorization: Bearer $NOTIFICATIONS_ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"New exam","body":"Practice exam #4 is live","audience":"all","url":"/tests/exams"}'
```

`audience` is `all`, `pro`, `free` or `user` (then add `"email": "..."` or `"userId": "..."`). Add `"push": false` for inbox only. `GET` on the same URL returns the last 50 sent.

## One-time setup

- [x] **Database:** migration `20261105000000_add_notifications` applied (`npx prisma migrate status` in `website/` says up to date, 2026-11-05).
- [x] **Android, Firebase config:** `app/google-services.json` (Firebase project `sat-prep-469713`, package `com.hrynchuk.satprepapp`), set as `android.googleServicesFile` in `app/app.config.ts`. Not a secret; it ships inside the app.
- [x] **Android, FCM V1 key:** service account key uploaded to EAS (`eas credentials` → Android → production → Google Service Account → FCM V1). The key file is a secret: never commit it.
- [ ] **Deploy the website** with the new routes and the admin page.
- [ ] **Make yourself admin:** `UPDATE "User" SET role = 'admin' WHERE email = 'you@example.com';` (or edit `role` in `npx prisma studio`).
- [ ] **Build and release the app** with `eas build`. Only phones on a build with this code register for pushes, so older versions can't receive them. For iPhone, when `eas build` asks to set up an Apple Push Notifications key, answer yes and EAS manages it.
- [ ] Optional: `NOTIFICATIONS_ADMIN_KEY` on the server, for sending from scripts.
- [ ] Optional: `EXPO_ACCESS_TOKEN` on the server, if you turn on "enhanced push security" in Expo.

### Creating the FCM V1 service account key (if it ever needs replacing)

1. console.cloud.google.com → project **sat-prep-469713**.
2. **APIs & Services → Library**: make sure **Firebase Cloud Messaging API** is enabled.
3. **IAM & Admin → Service Accounts** → `firebase-adminsdk-…@sat-prep-469713.iam.gserviceaccount.com` → **Keys → Add key → Create new key → JSON**.
   The same key is also available in Firebase: **Project settings → Service accounts → Generate new private key**.
4. In `app/`: `eas credentials` → Android → production → Google Service Account → Manage your Google Service Account Key for Push Notifications (FCM V1) → upload the file.
5. Store the file somewhere safe or delete it. Don't put it in the repo.

## Where the code is

| Part | File |
| --- | --- |
| Database models | `website/prisma/schema.prisma` (`PushToken`, `Notification`, `NotificationRead`) |
| Sending, audiences, Expo batches | `website/lib/notifications.ts` |
| Admin API | `website/app/api/admin/notifications/route.ts` |
| Admin page | `website/app/learn/(app)/admin/notifications/` |
| Token registration | `website/app/api/user/push-token/route.ts` |
| Inbox API | `website/app/api/user/notifications/route.ts`, `.../read/route.ts` |
| App: token, inbox, unread count | `app/lib/inbox.ts` |
| App: inbox screen | `app/app/notifications.tsx` |
| App: bell on Home | `app/app/(tabs)/index.tsx` |
| App: permission prompt, tap handling | `app/app/_layout.tsx` |
| App: daily study reminder (local, not push) | `app/lib/notifications.ts`, switch in `app/app/settings.tsx` |
