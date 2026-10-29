// The marketing site (satlearner.com) and the learning platform (app.satlearner.com)
// are one Next.js project; middleware.ts routes each host to its pages.
// Without these env vars (local dev) both live on the same host and links stay relative.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";

// A platform page, e.g. appUrl("/tests") → https://app.satlearner.com/tests
export const appUrl = (path: string = "/") => `${APP_URL}${path}`;

// A marketing page, e.g. siteUrl("/info/what-is-sat") → https://satlearner.com/info/what-is-sat
export const siteUrl = (path: string = "/") => `${SITE_URL}${path}`;
