import { getBlogIndex, getProfile } from "@/lib/content";
import { getAllPosts } from "@/lib/mdx";
import { absoluteUrl } from "@/lib/seo";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function GET() {
  const profile = getProfile();
  const blog = getBlogIndex();
  const posts = getAllPosts();

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`, profile.siteUrl);
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(post.description)}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(`${profile.name} — ${blog.title}`)}</title>
    <link>${absoluteUrl("/blog", profile.siteUrl)}</link>
    <description>${escapeXml(blog.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
