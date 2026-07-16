import type { MetadataRoute } from "next";
import { getCaseStudies, getProfile } from "@/lib/content";
import { getAllPosts } from "@/lib/mdx";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const profile = getProfile();
  const posts = getAllPosts();
  const caseStudies = getCaseStudies();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/", profile.siteUrl),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/blog", profile.siteUrl),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/resume", profile.siteUrl),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const postRoutes = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`, profile.siteUrl),
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const caseStudyRoutes = caseStudies.map((study) => ({
    url: absoluteUrl(`/case-studies/${study.slug}`, profile.siteUrl),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes, ...caseStudyRoutes];
}
