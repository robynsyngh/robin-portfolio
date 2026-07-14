"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "@/hooks/use-gsap";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
};

export function ScrollReveal({ children, className }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    if (reducedMotion) {
      gsap.set(element, { clearProps: "opacity,visibility,transform" });
      return;
    }

    const reveal = () => {
      gsap.to(element, {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const rect = element.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

    if (alreadyInView) {
      gsap.set(element, { autoAlpha: 0, y: 14 });
      reveal();
      return;
    }

    gsap.set(element, { autoAlpha: 0, y: 14 });

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) {
          return;
        }
        reveal();
        observer.disconnect();
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.05,
      },
    );

    observer.observe(element);

    // Safety: never leave content permanently hidden
    const fallback = window.setTimeout(() => {
      const opacity = Number.parseFloat(getComputedStyle(element).opacity || "1");
      if (opacity < 0.05) {
        reveal();
      }
      observer.disconnect();
    }, 2500);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, [reducedMotion]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
