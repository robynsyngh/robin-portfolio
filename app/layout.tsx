import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SiteShell } from "@/components/layout/site-shell";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { getEasterEggs, getLoader, getProfile } from "@/lib/content";
import { personJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const profile = getProfile();
const loader = getLoader();
const easterEggs = getEasterEggs();

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(profile.siteUrl),
  title: {
    default: `${profile.name} — ${profile.title}`,
    template: `%s — ${profile.name}`,
  },
  description: profile.summary,
  applicationName: `${profile.name} Portfolio`,
  authors: [{ name: profile.name, url: profile.siteUrl }],
  creator: profile.name,
  publisher: profile.name,
  keywords: [
    profile.name,
    "Senior Full Stack Engineer",
    "Node.js",
    "TypeScript",
    "Stripe",
    "Redis",
    "BullMQ",
    "OpenAI",
    "System Design",
    ...profile.focusAreas,
  ],
  alternates: {
    canonical: profile.siteUrl,
    types: {
      "application/rss+xml": `${profile.siteUrl.replace(/\/$/, "")}/feed.xml`,
    },
  },
  openGraph: {
    title: `${profile.name} — ${profile.title}`,
    description: profile.summary,
    type: "website",
    url: profile.siteUrl,
    siteName: profile.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.title}`,
    description: profile.summary,
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
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-background text-foreground antialiased">
        <JsonLd data={[personJsonLd(profile), websiteJsonLd(profile)]} />
        <Providers loader={loader} easterEggs={easterEggs}>
          <SiteShell>{children}</SiteShell>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
