import type { MetadataRoute } from "next";

const SITE = "https://www.satlearner.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/learn/", "/expo-course/"] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
