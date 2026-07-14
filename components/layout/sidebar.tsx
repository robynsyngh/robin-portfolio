"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { NavItem, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { TextLink } from "@/components/ui/text-link";
import { useLenis } from "@/components/smooth-scroll/lenis-context";
import {
  getHomeSectionIds,
  useActiveSection,
} from "@/hooks/use-active-section";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type SidebarProps = {
  profile: Profile;
  navigation: NavItem[];
};

const ease = [0.22, 1, 0.36, 1] as const;

function isNavActive(pathname: string, activeSectionId: string, href: string) {
  if (href === "/blog") {
    return pathname === "/blog" || pathname.startsWith("/blog/");
  }

  if (pathname !== "/") {
    return pathname === href;
  }

  if (href === "/") {
    return activeSectionId === "home";
  }

  if (href.startsWith("/#")) {
    return activeSectionId === href.slice(2);
  }

  return false;
}

export function Sidebar({ profile, navigation }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const sectionIds = useMemo(() => getHomeSectionIds(navigation), [navigation]);
  const { activeId, setActiveIdLocked } = useActiveSection(
    sectionIds,
    pathname === "/",
  );

  // Avoid SSR/client media-query mismatches on inert/tabIndex.
  const drawerInactive = mounted && !isDesktop && !open;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open && !isDesktop ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, isDesktop]);

  useEffect(() => {
    if (!open || isDesktop) {
      return;
    }

    firstLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, isDesktop]);

  const scrollToHash = (targetHash: string) => {
    const id = targetHash.replace(/^#/, "");
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    if (reducedMotion) {
      element.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    if (lenis) {
      lenis.scrollTo(element, { offset: 0, duration: 1.05 });
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    setOpen(false);

    if (href === "/blog" || (!href.startsWith("/#") && href !== "/")) {
      return;
    }

    const sectionId = href === "/" ? "home" : href.slice(2);
    setActiveIdLocked(sectionId);

    if (pathname === "/") {
      event.preventDefault();
      const nextUrl = sectionId === "home" ? "/" : `/#${sectionId}`;
      window.history.pushState(null, "", nextUrl);

      if (sectionId === "home") {
        if (reducedMotion) {
          window.scrollTo({ top: 0, behavior: "auto" });
        } else if (lenis) {
          lenis.scrollTo(0, { duration: 1.05 });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      scrollToHash(`#${sectionId}`);
      return;
    }

    event.preventDefault();
    router.push(sectionId === "home" ? "/" : `/#${sectionId}`);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-header items-center justify-between border-b border-border bg-background px-6 md:hidden">
        <Link
          href="/"
          className="min-h-11 font-mono text-sm tracking-wide text-foreground inline-flex items-center"
        >
          {profile.name}
        </Link>
        <button
          ref={menuButtonRef}
          type="button"
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center font-mono text-xs tracking-[0.18em] uppercase text-muted transition-colors duration-200 hover:text-foreground"
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.button
            key="nav-overlay"
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-background/80 md:hidden"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.28, ease }}
            onClick={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <aside
        id="site-navigation"
        aria-hidden={drawerInactive ? true : undefined}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-sidebar flex-col border-r border-border bg-background",
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          drawerInactive && "pointer-events-none",
        )}
      >
        <div className="flex h-full flex-col px-6 py-8 md:px-7 md:py-10">
          <Link
            ref={firstLinkRef}
            href="/"
            className="group block"
            tabIndex={drawerInactive ? -1 : undefined}
            onClick={(event) => handleNavClick(event, "/")}
          >
            <Text
              as="span"
              variant="mono"
              className="block text-foreground transition-opacity duration-200 group-hover:opacity-80"
            >
              {profile.name}
            </Text>
            <Text as="span" variant="label" className="mt-3 block normal-case tracking-wide">
              {profile.title}
            </Text>
          </Link>

          <nav aria-label="Primary" className="mt-12 flex-1 overflow-y-auto">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const active = isNavActive(pathname, activeId, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      tabIndex={drawerInactive ? -1 : undefined}
                      onClick={(event) => handleNavClick(event, item.href)}
                      className={cn(
                        "relative flex min-h-11 items-center py-2 font-mono text-sm tracking-wide transition-colors duration-200",
                        active
                          ? "text-foreground"
                          : "text-muted hover:text-foreground",
                      )}
                    >
                      <span
                        aria-hidden
                        className="relative mr-3 flex h-px w-4 items-center"
                      >
                        {active ? (
                          <motion.span
                            layoutId={mounted ? "nav-active-indicator" : undefined}
                            className="absolute inset-0 bg-accent"
                            transition={{
                              duration: reducedMotion ? 0 : 0.35,
                              ease,
                            }}
                          />
                        ) : null}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto space-y-4 border-t border-border pt-6">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {profile.social.map((item) => (
                <TextLink
                  key={item.href}
                  href={item.href}
                  subtle
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={drawerInactive ? -1 : undefined}
                  className="inline-flex min-h-11 items-center font-mono text-xs tracking-wide"
                >
                  {item.label}
                </TextLink>
              ))}
            </div>
            <TextLink
              href={profile.resumePath}
              subtle
              tabIndex={drawerInactive ? -1 : undefined}
              className="inline-flex min-h-11 items-center font-mono text-xs tracking-wide"
            >
              Resume
            </TextLink>
          </div>
        </div>
      </aside>
    </>
  );
}
