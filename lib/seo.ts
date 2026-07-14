import type { Metadata } from "next";
import { getProfile } from "@/lib/content";
import type { BlogPost, CaseStudy, Profile } from "@/lib/types";

export function absoluteUrl(path = "/", siteUrl?: string) {
  const profile = getProfile();
  const base = (siteUrl ?? profile.siteUrl).replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized === "/" ? "" : normalized}` || base;
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
}: {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}): Metadata {
  const profile = getProfile();
  const url = absoluteUrl(path, profile.siteUrl);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": absoluteUrl("/feed.xml", profile.siteUrl),
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: profile.name,
      locale: "en_US",
      type,
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(tags ? { tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function personJsonLd(profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.title,
    description: profile.summary,
    url: profile.siteUrl,
    email: profile.email,
    worksFor: {
      "@type": "Organization",
      name: profile.currentCompany,
    },
    sameAs: profile.social.map((item) => item.href),
    knowsAbout: profile.focusAreas,
  };
}

export function websiteJsonLd(profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${profile.name} Portfolio`,
    url: profile.siteUrl,
    description: profile.summary,
    author: {
      "@type": "Person",
      name: profile.name,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${profile.siteUrl}/blog?category={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function blogPostingJsonLd(post: BlogPost, profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: profile.name,
      url: profile.siteUrl,
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`, profile.siteUrl),
    articleSection: post.category,
    keywords: [post.category, ...profile.focusAreas],
  };
}

export function caseStudyJsonLd(study: CaseStudy, profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${study.title} Case Study`,
    description: study.summary,
    author: {
      "@type": "Person",
      name: profile.name,
      url: profile.siteUrl,
    },
    mainEntityOfPage: absoluteUrl(`/case-studies/${study.slug}`, profile.siteUrl),
    about: study.title,
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
  profile: Profile,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, profile.siteUrl),
    })),
  };
}
