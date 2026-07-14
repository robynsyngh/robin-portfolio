"use client";

import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { LenisProvider } from "@/components/smooth-scroll/lenis-context";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { markNavigatedWithinSession } from "@/lib/session-nav";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const pathname = usePathname();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const isFirstPathnameRef = useRef(true);

  useEffect(() => {
    if (isFirstPathnameRef.current) {
      isFirstPathnameRef.current = false;
      return;
    }
    markNavigatedWithinSession();
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = reducedMotion ? "true" : "false";

    if (reducedMotion) {
      setLenis(null);
      ScrollTrigger.refresh();
      return;
    }

    const instance = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1.1,
    });

    instance.on("scroll", ScrollTrigger.update);
    setLenis(instance);

    const tick = (time: number) => {
      instance.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", onResize);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hash = window.location.hash;

    if (!hash) {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
      requestAnimationFrame(() => ScrollTrigger.refresh());
      return;
    }

    const id = hash.slice(1);
    let attempts = 0;
    let cancelled = false;
    let lastTop: number | null = null;
    let stableFrames = 0;
    let userScrolled = false;
    let resizeObserver: ResizeObserver | null = null;
    let stopWatchingTimeout: number | null = null;

    const onUserScroll = () => {
      userScrolled = true;
    };

    const stopWatching = () => {
      if (stopWatchingTimeout !== null) {
        window.clearTimeout(stopWatchingTimeout);
        stopWatchingTimeout = null;
      }
      resizeObserver?.disconnect();
      resizeObserver = null;
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchmove", onUserScroll);
    };

    const jumpTo = (element: HTMLElement, behavior: "auto" | "smooth") => {
      if (reducedMotion) {
        element.scrollIntoView({ behavior: "auto", block: "start" });
      } else if (lenis) {
        lenis.scrollTo(element, {
          offset: 0,
          duration: behavior === "auto" ? 0 : 1.05,
          immediate: behavior === "auto",
        });
      } else {
        element.scrollIntoView({ behavior, block: "start" });
      }
    };

    // Lazy-loaded sections (dynamic imports) and GSAP-pinned sections can
    // still be reflowing layout after they mount, which shifts scroll
    // offsets out from under a one-shot scrollIntoView. Wait for the
    // target's position to stay put across a few frames before settling.
    const waitForStableLayout = () => {
      if (cancelled) {
        return;
      }

      const element = document.getElementById(id);
      if (!element) {
        attempts += 1;
        if (attempts < 90) {
          requestAnimationFrame(waitForStableLayout);
        }
        return;
      }

      ScrollTrigger.refresh();
      const top = element.getBoundingClientRect().top;

      if (lastTop !== null && Math.abs(top - lastTop) < 1) {
        stableFrames += 1;
      } else {
        stableFrames = 0;
      }
      lastTop = top;

      jumpTo(element, "auto");

      attempts += 1;
      if (stableFrames < 3 && attempts < 90) {
        requestAnimationFrame(waitForStableLayout);
        return;
      }

      // Final pass with the real animation once layout has settled.
      jumpTo(element, "smooth");
      requestAnimationFrame(() => ScrollTrigger.refresh());

      // Dynamically-imported sections (Architecture, Terminal) can still
      // swap in real content well after this point on a slow connection or
      // cold dev compile, shifting the page height again. Watch for that
      // and re-settle once, without fighting the user if they've since
      // scrolled elsewhere themselves.
      window.addEventListener("wheel", onUserScroll, { passive: true });
      window.addEventListener("touchmove", onUserScroll, { passive: true });

      resizeObserver = new ResizeObserver(() => {
        if (userScrolled || cancelled) {
          return;
        }
        const target = document.getElementById(id);
        if (target) {
          jumpTo(target, "auto");
        }
      });
      resizeObserver.observe(document.body);

      stopWatchingTimeout = window.setTimeout(stopWatching, 6000);
    };

    requestAnimationFrame(waitForStableLayout);

    return () => {
      cancelled = true;
      stopWatching();
    };
  }, [pathname, lenis, reducedMotion]);

  return <LenisProvider lenis={lenis}>{children}</LenisProvider>;
}
