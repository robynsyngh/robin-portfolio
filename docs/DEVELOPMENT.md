# Developer Guide

A practical, code-first reference for working in this repo. Written for someone opening the project for the first time — if you're already comfortable with Next.js App Router, skim the headings and jump to what you need.

> For product/design intent (voice, visual rules, what each section should say) see [`PORTFOLIO_SPEC.md`](../PORTFOLIO_SPEC.md). This doc is about **how the code is organized and how to work in it**.

---

## Navigate

- [Mental model](#mental-model)
- [Request lifecycle](#request-lifecycle-how-a-page-actually-renders)
- [Folder-by-folder reference](#folder-by-folder-reference)
- [The content layer](#the-content-layer-the-most-important-pattern-in-this-repo)
- [The terminal (deep dive)](#the-terminal-deep-dive)
- [The AI `ask` endpoint (deep dive)](#the-ai-ask-endpoint-deep-dive)
- [The blog (MDX) pipeline](#the-blog-mdx-pipeline)
- [Styling conventions](#styling-conventions)
- [Common workflows](#common-workflows-copy-pasteable)
- [Adding a new section to the homepage](#adding-a-new-section-to-the-homepage-step-by-step)
- [Gotchas & conventions](#gotchas--conventions)
- [Local setup](#local-setup)

---

## Mental model

This is a **Next.js 15 App Router** site with one hard rule: **components never hardcode content**. Every string, list, and number a component renders is passed in as a prop that ultimately traces back to a JSON file in `content/`.

```
content/*.json  →  lib/content.ts (typed getters)  →  app/**/page.tsx  →  components/**/*.tsx (dumb, presentational)
```

If you're fixing a typo or changing copy, you almost never touch a component — you edit a JSON file. If you're adding a new visual section, you touch content, a type, a content getter, a component, and a page — in that order.

---

## Request lifecycle (how a page actually renders)

Using the homepage (`/`) as the example:

1. **`app/layout.tsx`** (server component) runs first for every route. It calls `getProfile()`, `getLoader()`, `getEasterEggs()` from `lib/content.ts`, builds `<head>` metadata + JSON-LD, and wraps everything in `<Providers>` and `<SiteShell>`.
2. **`components/providers.tsx`** (client component) sets up cross-cutting client-side concerns that must wrap the whole app: smooth scrolling (`SmoothScroll`/Lenis), the easter-egg context, the boot-up loader screen, and a few `dynamic()`-imported, `ssr: false` extras (custom cursor, dev-mode HUD, unlock toasts, rubber duck).
3. **`components/layout/site-shell.tsx`** renders the persistent chrome — sidebar/nav, page transitions, scroll/request tracker — around the routed page content.
4. **`app/page.tsx`** (server component) is the actual homepage. It calls the `get*()` content functions it needs and renders one section component per feature, in page order, passing typed content down as props. Two heavy sections (`ArchitectureSection`, `PortfolioTerminal`) are loaded via `next/dynamic` to keep the initial JS bundle smaller.
5. Each **section component** (e.g. `components/hero/hero.tsx`) is presentational: it receives content as props and owns its own animation/layout logic (GSAP timelines, Framer Motion variants), but does not import from `content/` directly.

Other routes (`/blog`, `/blog/[slug]`, `/case-studies/[slug]`, `/resume`) follow the same shape: a server component page that fetches content/MDX, then renders presentational components.

---

## Folder-by-folder reference

### `app/` — routes only

Next.js App Router convention: each folder is a URL segment, `page.tsx` is the page, `route.ts` is an API handler.

| Path | What it is |
| --- | --- |
| `app/page.tsx` | Homepage — composes every section |
| `app/layout.tsx` | Root HTML shell, fonts, global metadata, JSON-LD, analytics |
| `app/template.tsx` | Per-navigation wrapper (page transition remount point) |
| `app/blog/page.tsx` | Blog index |
| `app/blog/[slug]/page.tsx` | Single MDX post |
| `app/case-studies/[slug]/page.tsx` | Single case study detail page |
| `app/resume/page.tsx` | Resume viewer/download page |
| `app/api/ask/route.ts` | `POST` handler that streams Gemini responses for the terminal's `ask` command |
| `app/sitemap.ts`, `app/robots.ts`, `app/feed.xml/route.ts` | Generated SEO/feed routes |
| `app/opengraph-image.tsx`, `app/icon.tsx`, `app/apple-icon.tsx` | Generated image routes (favicons, OG image) |
| `app/globals.css` | Tailwind entry + CSS variables/tokens |

**Rule of thumb:** if you're adding a new URL, you're working in `app/`. If you're adding a new visual block on an existing page, you're working in `components/`.

### `components/` — one folder per feature, plus `ui/`

Each homepage section has its own folder named after the section (`hero/`, `journey/`, `skills/`, `projects/`, `architecture/`, `case-studies/`, `achievements/`, `contact/`, `terminal/`, `blog/`). Cross-cutting concerns get their own folders too:

| Folder | Responsibility |
| --- | --- |
| `layout/` | `site-shell.tsx`, `sidebar.tsx`, `page-transition.tsx` — persistent chrome |
| `navigation/` | Nav-specific pieces used by the shell |
| `scroll/` | `request-tracker.tsx` — the scroll-progress "system" visualization |
| `smooth-scroll/`, `smooth-scroll.tsx` | Lenis wrapper |
| `background/` | `interactive-background.tsx` — the animated node/graph backdrop |
| `cursor/` | `custom-cursor.tsx` |
| `easter-eggs/` | Context provider + dev-mode HUD + unlock toast + rubber duck, all driven by `content/easter-eggs.json` |
| `loader/` | Boot-up loading screen |
| `seo/` | `json-ld.tsx` helper for structured data |
| `resume/` | `resume-actions.tsx` — download/print buttons on `/resume` |
| `ui/` | Shared, generic primitives with **no business logic**: `button`, `badge`, `container`, `section`, `stack`, `text`, `text-link`, `divider`, `typewriter`, `tilt-card`, `animated-number`. Re-exported from `ui/index.ts` for convenient `import { Button, Badge } from "@/components/ui"`. |

**Convention:** a feature component receives its content as a typed prop (e.g. `<Hero profile={profile} hero={hero} />`) and never imports `content/*.json` or `lib/content.ts` itself — only pages do that.

### `content/` — the data

See [The content layer](#the-content-layer-the-most-important-pattern-in-this-repo) below. One JSON file per concern, plus `content/blog/*.mdx` for long-form posts and `content/resume.pdf` as the source PDF.

### `lib/` — non-visual logic

| File/folder | Purpose |
| --- | --- |
| `lib/content.ts` | Imports every `content/*.json`, casts to types from `lib/types.ts`, exports one `get*()` function per content type. **This is the only file that should import raw JSON from `content/`.** |
| `lib/types.ts` | Every content shape as a TypeScript `type`. Add a type here whenever you add a new JSON file. |
| `lib/mdx.ts` | Reads/parses blog `.mdx` files from `content/blog/` (frontmatter via `gray-matter`, reading time via `reading-time`) |
| `lib/mdx-render.tsx`, `lib/mdx-components.tsx` | MDX rendering setup and custom component overrides (e.g. styled `<a>`, `<code>`) |
| `lib/seo.ts` | JSON-LD builders (`personJsonLd`, `websiteJsonLd`, `breadcrumbJsonLd`) and shared metadata helpers |
| `lib/session-nav.ts` | Small helper for tracking navigation/session state |
| `lib/utils.ts` | Generic helpers (e.g. `cn()` class merger via `clsx` + `tailwind-merge`) |
| `lib/ai/context.ts` | Builds the terminal AI's knowledge base string + system prompt from `content/*` via `lib/content.ts` getters |
| `lib/ai/rate-limit.ts` | In-memory per-IP rate limiter used by `app/api/ask/route.ts` |
| `lib/terminal/run-command.ts` | Pure function: `(input, context) => TerminalCommandResult`. All non-AI terminal command logic lives here. |

### `hooks/` — reusable React/GSAP hooks

`use-gsap.ts` (GSAP + `useGSAP` setup), `use-active-section.ts` (scroll-spy for nav), `use-media-query.ts`, `use-prefers-reduced-motion.ts`, `use-typing-sequence.ts` (typewriter timing).

### `public/`, `scripts/`, `docs/assets/`

`public/` holds static assets served as-is (including the synced resume PDF). `scripts/generate-resume.mjs` copies `content/resume.pdf` → `public/` (run via `npm run resume`). `docs/assets/` holds README/doc images only.

---

## The content layer (the most important pattern in this repo)

Adding or changing content always follows the same three-file pattern:

1. **Edit or add JSON** in `content/` (e.g. `content/skills.json`).
2. **Type it** in `lib/types.ts` if the shape is new (e.g. `export type SkillsContent = { ... }`).
3. **Expose a getter** in `lib/content.ts`:

```ts
import skillsData from "@/content/skills.json";
import type { SkillsContent } from "@/lib/types";

const skills = skillsData as SkillsContent;

export function getSkills(): SkillsContent {
  return skills;
}
```

4. A page (`app/page.tsx`, etc.) calls `getSkills()` and passes the result to `<SkillsSection skills={skills} />` as a prop.

Why this indirection instead of importing JSON directly in components? It keeps every component pure/presentational and testable, keeps all content typed in one place, and means a fresher can update the entire site's copy without reading component code — just edit `content/*.json`.

**When editing existing content**, just change the JSON value; no code changes needed as long as the shape (keys) stays the same. **When the shape changes** (new field, renamed field), update `lib/types.ts` and every place that reads the changed field.

---

## The terminal (deep dive)

The interactive terminal (`components/terminal/portfolio-terminal.tsx`) is a fun but genuinely useful part of the codebase to understand because it touches content, pure logic, and an API route.

- **Static commands** (`help`, `about`, `whoami`, `projects`, `skills`, `architecture`, `blog`, `contact`, `resume`, `github`, `linkedin`, plus easter eggs like `sudo hire robin`, `npm install robin`, `git log`, `redis-cli`, `stripe test`, `coffee`) are handled entirely client-side by `runTerminalCommand()` in [`lib/terminal/run-command.ts`](../lib/terminal/run-command.ts). It's a pure function — `(rawInput, context) => TerminalCommandResult` — with no side effects, so it's easy to test or extend: add an `if (normalized === "your-command")` branch and return `{ lines: [...] }`.
- **`TerminalCommandResult`** (see `lib/types.ts`) can also signal `clear`, `open` (navigate), `download` (trigger a file download), `effect` (play a themed animation), or `enableDeveloperMode`.
- **`ask <question>`** is the one command that isn't pure/local — the terminal component `fetch`es `POST /api/ask` and streams the response into the terminal output as it arrives.

To add a new terminal command:
1. Add its metadata to `content/terminal.json` (`commands` array) so it shows up in `help`.
2. Add a branch in `runTerminalCommand()` returning the lines/behavior you want.
3. If it needs data not already in `TerminalContext`, add it to the `TerminalContext` type and to the `context={{ ... }}` prop passed from `app/page.tsx`.

---

## The AI `ask` endpoint (deep dive)

`app/api/ask/route.ts` is a Next.js **Route Handler** (`runtime = "nodejs"`) that:

1. Reads `GEMINI_API_KEY` from env — if missing, returns a friendly plain-text fallback instead of erroring (AI mode is optional, the site works fine without it).
2. Validates and truncates the incoming `question` (and short `history` for follow-ups), rejecting empty input.
3. Rate-limits by client IP via `lib/ai/rate-limit.ts` (simple in-memory sliding window — fine for a single-instance deployment, not distributed-safe).
4. Builds a system prompt via `buildSystemPrompt()` in `lib/ai/context.ts`, which serializes `profile`, `experience`, `projects`, `skills`, `case-studies`, and `achievements` from `lib/content.ts` into a compact "knowledge base" string, so the model can only answer from real site content (it's instructed not to invent facts).
5. Calls Gemini's `streamGenerateContent` SSE endpoint directly via `fetch` (no SDK dependency), with one quiet retry on `503`/`429`.
6. Re-streams the model's text deltas back to the client as a raw `text/plain` stream (parsing Gemini's `data: {...}` SSE lines itself).

If you want the AI to know about a new fact, add it to the relevant `content/*.json` file — `buildPortfolioKnowledgeBase()` will pick it up automatically as long as it reads from a getter already listed in `context.ts`. If you add a brand-new content type you want the AI to know about, import its getter in `lib/ai/context.ts` and add a new `sections.push(...)` block.

---

## The blog (MDX) pipeline

1. Write a post as `content/blog/your-slug.mdx` with frontmatter matching `BlogFrontmatter` in `lib/types.ts` (`title`, `description`, `date`, `category`, `published`).
2. `lib/mdx.ts` reads all files in `content/blog/`, parses frontmatter with `gray-matter`, computes `readingTime`, and returns typed `BlogPost` objects (only `published: true` posts should surface on the public index — check `lib/mdx.ts` for the exact filter).
3. `app/blog/page.tsx` lists posts (via `content/blog.json` for index copy + `lib/mdx.ts` for the post list); `app/blog/[slug]/page.tsx` renders one post's MDX body via `lib/mdx-render.tsx`, using custom component overrides from `lib/mdx-components.tsx`.
4. Posts are also picked up by `app/feed.xml/route.ts` (RSS) and `app/sitemap.ts`.

To add a post: create the `.mdx` file, set `published: true` when ready, done — no other code changes needed.

---

## Styling conventions

- **Tailwind CSS v4**, configured via `app/globals.css` (no separate `tailwind.config`-driven theme — v4 uses CSS-first config with `@theme`/CSS variables). Design tokens (spacing like `--space-section`, colors) live there.
- **Monochrome by design constraint** — no purple/glassmorphism/gradient wallpaper (see `PORTFOLIO_SPEC.md`). If a component needs a new color, question it before adding one.
- **Motion split by tool:** GSAP + ScrollTrigger (`hooks/use-gsap.ts`) for scroll-driven timelines; Framer Motion for discrete component-level animation (mount/hover/tap). Don't mix both for the same animation.
- `components/ui/` primitives (`Button`, `Badge`, `Container`, `Section`, `Stack`, `Text`, `TextLink`) should be your first stop before writing raw `<div className="...">` — check `components/ui/index.ts` for what already exists.
- Use the `cn()` helper from `lib/utils.ts` for conditional/merged class names instead of manual string concatenation.

---

## Common workflows (copy-pasteable)

**Change existing copy/data on the site**
→ Edit the relevant file in `content/*.json`. No component/code changes needed.

**Add a new project**
→ Add an entry to `content/projects.json` matching the `Project` type in `lib/types.ts`. If it has a case study, also add to `content/case-studies.json` with matching `projectIds`.

**Add a new blog post**
→ Add `content/blog/my-post.mdx` with correct frontmatter. See [blog pipeline](#the-blog-mdx-pipeline).

**Add a new terminal command**
→ See [terminal deep dive](#the-terminal-deep-dive).

**Update the resume**
→ Replace `content/resume.pdf`, run `npm run resume` to sync it into `public/`.

**Change AI terminal behavior/knowledge**
→ Edit `content/*.json` (new facts) or `lib/ai/context.ts` (new rules/tone in `buildSystemPrompt`).

---

## Adding a new section to the homepage (step-by-step)

Say you want a new "Testimonials" section.

1. **Content:** create `content/testimonials.json`, e.g. `{ "eyebrow": "...", "title": "...", "items": [...] }`.
2. **Type:** add `TestimonialsContent` (and any nested item type) to `lib/types.ts`.
3. **Getter:** in `lib/content.ts`, import the JSON, cast it, add `getTestimonials()`.
4. **Component:** create `components/testimonials/testimonials-section.tsx` — a presentational component accepting `{ testimonials: TestimonialsContent }` as props, styled with existing `ui/` primitives and your chosen motion approach.
5. **Wire it up:** in `app/page.tsx`, call `const testimonials = getTestimonials();` and render `<TestimonialsSection testimonials={testimonials} />` in the right position in the JSX tree. Use `dynamic()` import if it's heavy/below-the-fold, following the `ArchitectureSection` pattern.
6. **Nav (optional):** if the section needs a nav anchor, add it to `content/navigation.json` and confirm `hooks/use-active-section.ts` picks up its `id`.

---

## Gotchas & conventions

- **Never `import` from `content/*.json` inside a component.** Always go through a `get*()` function in `lib/content.ts`, called from a page.
- **Server vs. client components:** most of `app/**/page.tsx` and `lib/content.ts` consumers are server components (no `"use client"`). Anything using GSAP, Framer Motion hooks, browser APIs, or React state needs `"use client"` at the top — see `components/providers.tsx` for an example.
- **Dynamic imports (`next/dynamic`)** are used for heavy or below-the-fold pieces (`ArchitectureSection`, `PortfolioTerminal`, the easter-egg overlays, `CustomCursor`) to keep first-load JS small. Follow the same pattern when adding something similarly heavy.
- **The terminal's `ask` command is the only network call** most users trigger; it gracefully degrades with no `GEMINI_API_KEY` set, so the app is fully functional without any env vars.
- **Don't hardcode strings that are "content"** (names, numbers, taglines, lists) directly in a component — even placeholder text has a way of becoming permanent. Put it in `content/`.
- **Path alias:** `@/*` maps to the repo root (see `tsconfig.json`), so imports look like `@/lib/content`, `@/components/ui`.

---

## Local setup

```bash
npm install
cp .env.example .env.local   # optional — only needed for terminal AI mode
npm run dev                  # http://localhost:3000, Turbopack
npm run lint                 # ESLint
npm run build && npm start   # production build/serve
npm run resume                # sync content/resume.pdf -> public/
```

No database, no auth, no build-time API calls required — everything renders from local JSON/MDX. The only optional external dependency is the Gemini API for the terminal's `ask` command (see `.env.example`).
