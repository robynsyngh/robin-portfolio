import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  const profile = getProfile();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${profile.siteUrl.replace(/\/$/, "")}/sitemap.xml`,
    host: profile.siteUrl.replace(/\/$/, ""),
  };
}
