import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogFrontmatter, BlogPost } from "@/lib/types";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

function isPublished(data: BlogFrontmatter): boolean {
  return data.published !== false;
}

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

function normalizeFrontmatter(data: Record<string, unknown>): BlogFrontmatter {
  const dateValue = data.date;

  return {
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    category: String(data.category ?? ""),
    published: data.published !== false,
    date:
      dateValue instanceof Date
        ? dateValue.toISOString().slice(0, 10)
        : String(dateValue ?? ""),
  };
}

export function getPostBySlug(slug: string): BlogPost {
  const fullPath = path.join(BLOG_DIR, `${slug}.mdx`);
  const source = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(source);
  const frontmatter = normalizeFrontmatter(data);

  return {
    ...frontmatter,
    slug,
    content,
    readingTime: readingTime(content).text,
  };
}

export function getAllPosts(): BlogPost[] {
  return getBlogSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post) => isPublished(post))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostsByCategory(category?: string): BlogPost[] {
  const posts = getAllPosts();

  if (!category) {
    return posts;
  }

  return posts.filter(
    (post) => post.category.toLowerCase() === category.toLowerCase(),
  );
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getPostBySlug(slug);

  return getAllPosts()
    .filter((post) => post.slug !== slug)
    .sort((a, b) => {
      const aSame = a.category === current.category ? 1 : 0;
      const bSame = b.category === current.category ? 1 : 0;
      return bSame - aSame;
    })
    .slice(0, limit);
}

export function getBlogCategoriesFromPosts(): string[] {
  return [...new Set(getAllPosts().map((post) => post.category))];
}
