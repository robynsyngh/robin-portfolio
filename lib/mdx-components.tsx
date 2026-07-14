import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h1: (props) => (
    <h1 className="mt-10 text-3xl font-medium tracking-tight text-foreground" {...props} />
  ),
  h2: (props) => (
    <h2 className="mt-8 text-2xl font-medium tracking-tight text-foreground" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-6 text-xl font-medium tracking-tight text-foreground" {...props} />
  ),
  p: (props) => <p className="mt-4 text-base leading-relaxed text-muted" {...props} />,
  a: (props) => (
    <a
      className="underline decoration-border underline-offset-4 transition hover:text-foreground"
      {...props}
    />
  ),
  ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-5 text-muted" {...props} />,
  ol: (props) => <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted" {...props} />,
  code: (props) => (
    <code
      className="rounded-sm border border-border bg-surface px-1.5 py-0.5 font-mono text-sm text-foreground"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-6 overflow-x-auto rounded-sm border border-border bg-surface p-4 font-mono text-sm text-foreground"
      {...props}
    />
  ),
};
