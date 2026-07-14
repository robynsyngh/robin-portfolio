import { Badge, Container, Stack, Text, TextLink } from "@/components/ui";
import type { BlogIndexContent, BlogPost } from "@/lib/types";
import { cn } from "@/lib/utils";

type BlogIndexProps = {
  content: BlogIndexContent;
  posts: BlogPost[];
  activeCategory?: string;
};

export function BlogIndex({ content, posts, activeCategory }: BlogIndexProps) {
  return (
    <div className="py-[var(--space-section)]">
      <Container narrow>
        <Stack gap="lg">
          <div>
            <Text as="p" variant="label">
              {content.title}
            </Text>
            <Text as="h1" variant="heading" className="mt-4">
              {content.headline}
            </Text>
            <Text as="p" variant="muted" className="mt-4">
              {content.description}
            </Text>
            <TextLink
              href="/feed.xml"
              subtle
              className="mt-4 inline-block font-mono text-xs tracking-wide"
            >
              RSS feed
            </TextLink>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border pt-8">
            <TextLink
              href="/blog"
              className={cn(
                "no-underline",
                !activeCategory ? "text-foreground" : "text-muted hover:text-foreground",
              )}
            >
              <Badge className={!activeCategory ? "border-accent/40 text-foreground" : undefined}>
                All
              </Badge>
            </TextLink>
            {content.categories.map((category) => {
              const active = activeCategory?.toLowerCase() === category.toLowerCase();

              return (
                <TextLink
                  key={category}
                  href={`/blog?category=${encodeURIComponent(category)}`}
                  className="no-underline"
                >
                  <Badge
                    className={
                      active ? "border-accent/40 text-foreground" : "hover:text-foreground"
                    }
                  >
                    {category}
                  </Badge>
                </TextLink>
              );
            })}
          </div>

          <ul className="space-y-10 border-t border-border pt-10">
            {posts.length === 0 ? (
              <li>
                <Text as="p" variant="muted">
                  No posts in this category yet.
                </Text>
              </li>
            ) : (
              posts.map((post) => (
                <li key={post.slug} className="border-b border-border pb-10 last:border-b-0">
                  <TextLink href={`/blog/${post.slug}`} className="group block no-underline">
                    <Text as="p" variant="mono">
                      {post.category} · {post.date} · {post.readingTime}
                    </Text>
                    <Text
                      as="h2"
                      variant="title"
                      className="mt-3 transition-opacity group-hover:opacity-80"
                    >
                      {post.title}
                    </Text>
                    <Text as="p" variant="muted" className="mt-3">
                      {post.description}
                    </Text>
                  </TextLink>
                </li>
              ))
            )}
          </ul>
        </Stack>
      </Container>
    </div>
  );
}
