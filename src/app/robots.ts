import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/fleet", "/about", "/airport", "/contact"],
      disallow: ["/admin/", "/dashboard/", "/api/", "/auth/", "/login", "/signup", "/onboarding"],
    },
    sitemap: "https://3mcarrentals.in/sitemap.xml",
    host: "https://3mcarrentals.in",
  };
}
