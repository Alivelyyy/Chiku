import type { MetadataRoute } from "next";

const BASE_URL = "https://chiku.apexdev.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,               lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/features`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/commands`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/premium`,  lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/faq`,      lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`,    lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contact`,  lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${BASE_URL}/privacy`,  lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${BASE_URL}/terms`,    lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
  ];

  return staticRoutes;
}
