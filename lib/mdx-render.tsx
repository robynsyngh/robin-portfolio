import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/lib/mdx-components";

export function MdxContent({ source }: { source: string }) {
  return <MDXRemote source={source} components={mdxComponents} />;
}
