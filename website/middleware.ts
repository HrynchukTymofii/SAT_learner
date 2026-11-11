import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Two sites from one project:
 * - app.satlearner.com: the learning platform. Every path is served from app/learn
 *   (app.satlearner.com/tests → app/learn/(app)/tests), so platform links stay "/tests".
 * - satlearner.com: the marketing site. Old platform paths (/dashboard, /course/...)
 *   redirect to the app subdomain, so bookmarks and links keep working.
 *
 * Local dev: open app.localhost:3000 for the platform and localhost:3000 for the site.
 * Without NEXT_PUBLIC_APP_URL, platform paths on the main host are served directly.
 */

// Pages of the platform, as seen in the browser
const PLATFORM_PATHS = ["/dashboard", "/course", "/courses", "/tests", "/test", "/planner", "/profile", "/login", "/register", "/pricing", "/admin"];
// Pages of the marketing site that the platform links to
const MARKETING_PATHS = ["/info", "/privacy-policy", "/terms-of-service", "/sat-course", "/sww"];
// Landing pages a logged-in student doesn't need: they go straight to the platform
const LANDING_PATHS = ["/", "/sat-course"];

const matches = (path: string, list: string[]) =>
  list.some((p) => path === p || path.startsWith(`${p}/`));

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  // Not the API (the mobile app calls satlearner.com/api), Next internals, the pages
  // the mobile app embeds (/expo-course) or files like /favicon.ico
  if (/^\/(api|_next|expo-course)(\/|$)/.test(pathname) || /\.[a-z0-9]+$/i.test(pathname)) {
    return NextResponse.next();
  }
  const isAppHost = (req.headers.get("host") ?? "").startsWith("app.");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // /learn is an internal folder: send /learn/tests to the platform's /tests
  if (pathname === "/learn" || pathname.startsWith("/learn/")) {
    const path = pathname.slice("/learn".length) || "/";
    if (isAppHost) return NextResponse.redirect(new URL(path + search, req.url));
    if (appUrl) return NextResponse.redirect(new URL(path + search, appUrl));
    return NextResponse.next();
  }

  if (isAppHost) {
    if (matches(pathname, MARKETING_PATHS)) {
      return siteUrl ? NextResponse.redirect(new URL(pathname + search, siteUrl)) : NextResponse.next();
    }
    return NextResponse.rewrite(new URL(`/learn${pathname === "/" ? "" : pathname}${search}`, req.url));
  }

  if (LANDING_PATHS.includes(pathname) && (await getToken({ req }))) {
    // Without NEXT_PUBLIC_APP_URL (local dev) the platform home lives at /learn
    return NextResponse.redirect(appUrl ? new URL("/", appUrl) : new URL("/learn", req.url));
  }

  if (matches(pathname, PLATFORM_PATHS)) {
    if (appUrl) return NextResponse.redirect(new URL(pathname + search, appUrl));
    return NextResponse.rewrite(new URL(`/learn${pathname}${search}`, req.url));
  }

  return NextResponse.next();
}
