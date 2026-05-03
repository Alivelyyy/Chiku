import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/features", "/commands", "/premium", "/faq", "/about", "/contact", "/privacy", "/terms"],
        disallow: ["/api/", "/dashboard/", "/login", "/servers/"],
      },
    ],
    sitemap: "https://chiku.apexdev.xyz/sitemap.xml",
  };
}
