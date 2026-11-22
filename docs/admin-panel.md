# Admin panel: editing the course

`app.satlearner.com/admin` (locally: `app.localhost:3000/admin`). Only for course admins.

| Page | What you do there |
|---|---|
| `/admin` | Chapters: add, drag to reorder, open |
| `/admin/chapters/[id]` | Chapter title/description, Published/Free, lessons + quizzes (drag to reorder), add lesson/quiz, delete |
| `/admin/lessons/[id]` | Title, points, Published/Free, **video upload (R2)** or YouTube link, rich text (formulas, images, YouTube) |
| `/admin/quizzes/[id]` | Quiz settings, questions list (drag to reorder, warns when a question has no correct answer) |
| `/admin/questions/[id]` | Type, question text, picture + height, options and correct answers, hint + hint image, explanation, points, Prev/Next, Duplicate |
| `/admin/notifications` | Push notifications (already existed) |

Changes go live right away on the website and in the app (both read the same database).
Ctrl+S saves; moving to the next question saves the current one.

Code: `website/app/learn/(app)/admin/` (pages + `actions.ts`), `website/components/admin/rich-editor.tsx`,
`website/lib/admin.ts` (who is admin), `website/lib/r2.ts` + `website/app/api/admin/upload/route.ts` (uploads).

## 1. Make someone an admin

Both are needed: the role in the database **and** the email in `ADMIN_EMAILS`.
Admins also get PRO and can switch to "preview as a free student" on the platform.

Neon → the SAT project → SQL Editor:

```sql
-- check first
SELECT "userId", email, role, platform FROM "User" WHERE email ILIKE 'new.admin@example.com';

UPDATE "User" SET role = 'admin' WHERE email ILIKE 'new.admin@example.com';

-- remove an admin
UPDATE "User" SET role = 'user' WHERE email ILIKE 'old.admin@example.com';
```

If one person has two accounts (e.g. Google + email), set the role only on the one they log in with.

Vercel → SAT project → Settings → Environment Variables → `ADMIN_EMAILS` (comma separated) → Redeploy.

## 2. Cloudflare R2 (images + videos)

1. Cloudflare dashboard → **R2** → **Create bucket** → name `sat-media` (any region).
2. Bucket → **Settings** → **Public access** → **Custom Domains** → **Connect domain** → `media.satlearner.com`.
   This needs satlearner.com's DNS on Cloudflare in the same account: import `docs/cloudflare/satlearner.com.zone`
   and switch the nameservers at Hostinger first. The domain itself stays registered at Hostinger.
   (The r2.dev subdomain works without that, but it's rate-limited: for testing only.)
3. Bucket → **Settings** → **CORS policy** → paste:

   ```json
   [
     {
       "AllowedOrigins": ["https://app.satlearner.com", "http://app.localhost:3000", "http://localhost:3000"],
       "AllowedMethods": ["PUT", "GET", "HEAD"],
       "AllowedHeaders": ["content-type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

   Without this, uploads fail with "Upload failed. Check the R2 CORS settings."
4. R2 → **Manage API tokens** → **Create API token** → permission **Object Read & Write**, only bucket `sat-media`.
   Copy the Access Key ID and Secret Access Key (shown once).
5. Add to Vercel (Production + Preview) and to `website/.env`:

   ```
   R2_ACCOUNT_ID=...            # R2 overview page, right side
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET=sat-media
   R2_PUBLIC_URL=https://media.satlearner.com   # or the r2.dev URL, no trailing slash
   ```
6. Redeploy.

Limits: images up to 10 MB (png/jpg/webp/gif/svg), videos up to 2 GB (mp4/mov/webm).
**Upload videos as MP4 (H.264)**: it plays on the website, iPhone and Android. The browser uploads straight to R2,
so size isn't limited by Vercel. R2 has no egress fees; storage is about $0.015/GB per month.

## Notes

- All old UploadThing images were copied to R2 (`media.satlearner.com/uploadthing/…`) and the database URLs
  rewritten; nothing depends on UploadThing any more.
- Files deleted from the editor stay in R2 until the weekly cleanup (`/api/cron/r2-cleanup`) removes files
  no row references.
- The mobile app plays only `Lesson.videoUrl` (the uploaded video). A YouTube link shows only on the website.
- Deleting a chapter/quiz/question also removes students' results and saved questions for it.
