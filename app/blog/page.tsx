import { BlogIndex } from "@/components/blog/blog-index";
import { JsonLd } from "@/components/seo/json-ld";
import { getBlogIndex, getProfile } from "@/lib/content";
import { getPostsByCategory } from "@/lib/mdx";
import { absoluteUrl, breadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

type BlogPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export async function generateMetadata({ searchParams }: BlogPageProps) {
  const { category } = await searchParams;
  const content = getBlogIndex();
  const title = category ? `${category} — Blog` : content.title;
  const description = category
    ? `${content.description} Filtered by ${category}.`
    : content.description;

  return buildPageMetadata({
    title,
    description,
    path: category ? `/blog?category=${encodeURIComponent(category)}` : "/blog",
  });
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { category } = await searchParams;
  const content = getBlogIndex();
  const profile = getProfile();
  const posts = getPostsByCategory(category);
  const activeCategory = content.categories.find(
    (entry) => entry.toLowerCase() === category?.toLowerCase(),
  );

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(
            [
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
              ...(activeCategory
                ? [
                    {
                      name: activeCategory,
                      path: `/blog?category=${encodeURIComponent(activeCategory)}`,
                    },
                  ]
                : []),
            ],
            profile,
          ),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: content.title,
            description: content.description,
            url: absoluteUrl("/blog", profile.siteUrl),
            blogPost: posts.map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              url: absoluteUrl(`/blog/${post.slug}`, profile.siteUrl),
              datePublished: post.date,
            })),
          },
        ]}
      />
      <BlogIndex
        content={content}
        posts={posts}
        activeCategory={activeCategory}
      />
    </>
  );
}
