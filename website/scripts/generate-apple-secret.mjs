// Makes APPLE_SECRET for "Sign in with Apple" on the website (NextAuth Apple provider).
// Apple allows at most 6 months, so run this again before it expires (put a reminder in your calendar).
//
// Run in website/:
//   node scripts/generate-apple-secret.mjs <path to AuthKey_XXXX.p8> <Team ID> <Key ID> <Services ID>
// Example:
//   node scripts/generate-apple-secret.mjs ./AuthKey_ABC123DEFG.p8 7J5Y87455X ABC123DEFG com.example.satlearner.web
//
// Where to find them (developer.apple.com → Certificates, IDs & Profiles):
//   .p8 + Key ID  Keys → a key with "Sign in with Apple" enabled (the .p8 downloads only once)
//   Team ID       top right of the developer portal (Membership details)
//   Services ID   Identifiers → Services IDs (the same value as APPLE_ID in .env)
// Paste the printed token into APPLE_SECRET in .env and on Vercel, then redeploy.
// Never commit the .p8 file.

import fs from "node:fs";
import jwt from "jsonwebtoken";

const [keyPath, teamId, keyId, servicesId] = process.argv.slice(2);
if (!keyPath || !teamId || !keyId || !servicesId) {
  console.error("Usage: node scripts/generate-apple-secret.mjs <AuthKey.p8> <Team ID> <Key ID> <Services ID>");
  process.exit(1);
}

const now = Math.floor(Date.now() / 1000);
const token = jwt.sign(
  { iss: teamId, iat: now, exp: now + 86400 * 180, aud: "https://appleid.apple.com", sub: servicesId },
  fs.readFileSync(keyPath),
  { algorithm: "ES256", keyid: keyId },
);

console.log(token);
console.error(`\nExpires ${new Date((now + 86400 * 180) * 1000).toISOString().slice(0, 10)}. Make a new one before then.`);
