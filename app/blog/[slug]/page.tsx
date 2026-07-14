import { notFound } from "next/navigation";
import { Container, Stack, Text, TextLink } from "@/components/ui";
import { JsonLd } from "@/components/seo/json-ld";
import { getProfile } from "@/lib/content";
import { MdxContent } from "@/lib/mdx-render";
import {
  getAllPosts,
  getBlogSlugs,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/mdx";
import {
  blogPostingJsonLd,
  breadcrumbJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;

  try {
    const post = getPostBySlug(slug);

    if (!post.published) {
      return {};
    }

    return buildPageMetadata({
      title: post.title,
      description: post.description,
      path: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.date,
      tags: [post.category],
    });
  } catch {
    return {};
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const posts = getAllPosts();
  const post = posts.find((entry) => entry.slug === slug);

  if (!post) {
    notFound();
  }

  const profile = getProfile();
  const related = getRelatedPosts(slug);

  return (
    <>
      <JsonLd
        data={[
          blogPostingJsonLd(post, profile),
          breadcrumbJsonLd(
            [
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
              { name: post.title, path: `/blog/${post.slug}` },
            ],
            profile,
          ),
        ]}
      />

      <div className="py-[var(--space-section)]">
        <Container narrow>
          <Stack gap="lg">
            <div>
              <TextLink href="/blog" subtle className="font-mono text-xs tracking-wide">
                ← Blog
              </TextLink>
              <Text as="p" variant="mono" className="mt-8">
                {post.category} · {post.date} · {post.readingTime}
              </Text>
              <Text as="h1" variant="heading" className="mt-4">
                {post.title}
              </Text>
              <Text as="p" variant="muted" className="mt-4">
                {post.description}
              </Text>
            </div>

            <article>
              <MdxContent source={post.content} />
            </article>

            {related.length > 0 ? (
              <div className="border-t border-border pt-10">
                <Text as="p" variant="label">
                  Related
                </Text>
                <ul className="mt-6 space-y-6">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <TextLink
                        href={`/blog/${item.slug}`}
                        className="group block no-underline"
                      >
                        <Text as="p" variant="mono">
                          {item.category}
                        </Text>
                        <Text
                          as="h2"
                          variant="title"
                          className="mt-2 text-xl transition-opacity group-hover:opacity-80"
                        >
                          {item.title}
                        </Text>
                      </TextLink>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Stack>
        </Container>
      </div>
    </>
  );
}
