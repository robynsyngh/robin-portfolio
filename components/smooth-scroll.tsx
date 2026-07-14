"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { LenisProvider } from "@/components/smooth-scroll/lenis-context";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();
  const pathname = usePathname();
  const [lenis, setLenis] = useState<Lenis | null>(null);

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

    const scrollToTarget = () => {
      const element = document.getElementById(id);
      if (!element) {
        if (attempts < 12) {
          attempts += 1;
          requestAnimationFrame(scrollToTarget);
        }
        return;
      }

      if (reducedMotion) {
        element.scrollIntoView({ behavior: "auto", block: "start" });
      } else if (lenis) {
        lenis.scrollTo(element, { offset: 0, duration: 1.05 });
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    requestAnimationFrame(scrollToTarget);
  }, [pathname, lenis, reducedMotion]);

  return <LenisProvider lenis={lenis}>{children}</LenisProvider>;
}
