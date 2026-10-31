import type { MetadataRoute } from "next";

// The host the marketing site is served from: satlearner.com redirects here
const SITE ="https://www.satlearner.com";

// Public pages of the marketing site. The platform (app.satlearner.com) is behind login
const PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/sat-course", priority: 0.9 },
  { path: "/info", priority: 0.8 },
  { path: "/info/what-is-sat", priority: 0.7 },
  { path: "/info/how-sat-is-scored", priority: 0.7 },
  { path: "/info/test-dates-registration", priority: 0.7 },
  { path: "/sww", priority: 0.5 },
  { path: "/privacy-policy", priority: 0.2 },
  { path: "/terms-of-service", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, priority }) => ({
    url: `${SITE}${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority,
  }));
}
