"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "@/components/smooth-scroll/lenis-context";
import type { NavItem } from "@/lib/types";

function sectionIdFromHref(href: string) {
  if (href === "/") {
    return "home";
  }

  if (href.startsWith("/#")) {
    return href.slice(2);
  }

  return null;
}

export function getHomeSectionIds(navigation: NavItem[]) {
  const ids: string[] = [];

  for (const item of navigation) {
    const id = sectionIdFromHref(item.href);
    if (id && !ids.includes(id)) {
      ids.push(id);
    }
  }

  return ids;
}

export function useActiveSection(sectionIds: string[], enabled: boolean) {
  const lenis = useLenis();
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "home");
  const lockedUntilRef = useRef(0);
  const sectionIdsKey = sectionIds.join("|");

  const resolveActive = useCallback(() => {
    if (!enabled || sectionIds.length === 0) {
      return;
    }

    if (Date.now() < lockedUntilRef.current) {
      return;
    }

    const marker = window.innerHeight * 0.28;
    let current = sectionIds[0] ?? "home";

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (!element) {
        continue;
      }

      if (element.getBoundingClientRect().top <= marker) {
        current = id;
      }
    }

    const scrolledToBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 8;

    if (scrolledToBottom) {
      current = sectionIds[sectionIds.length - 1] ?? current;
    }

    setActiveId((prev) => (prev === current ? prev : current));
  }, [enabled, sectionIds, sectionIdsKey]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    resolveActive();

    if (lenis) {
      lenis.on("scroll", resolveActive);
      return () => {
        lenis.off("scroll", resolveActive);
      };
    }

    window.addEventListener("scroll", resolveActive, { passive: true });
    window.addEventListener("resize", resolveActive);
    return () => {
      window.removeEventListener("scroll", resolveActive);
      window.removeEventListener("resize", resolveActive);
    };
  }, [enabled, lenis, resolveActive]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const nextUrl = activeId === "home" ? "/" : `/#${activeId}`;
    const currentUrl = `${window.location.pathname}${window.location.hash}`;

    if (currentUrl !== nextUrl && window.location.pathname === "/") {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [activeId, enabled]);

  const setActiveIdLocked = useCallback((id: string, lockMs = 1100) => {
    lockedUntilRef.current = Date.now() + lockMs;
    setActiveId(id);
  }, []);

  return { activeId, setActiveIdLocked };
}
