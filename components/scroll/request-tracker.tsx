"use client";

import { useEffect, useMemo, useState } from "react";
import type { ScrollProgressContent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/smooth-scroll/lenis-context";
import { useGSAP, ScrollTrigger } from "@/hooks/use-gsap";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type RequestTrackerProps = {
  progress: ScrollProgressContent;
};

export function RequestTracker({ progress }: RequestTrackerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const lenis = useLenis();
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const stages = progress.stages;

  const activeStage = useMemo(
    () => stages[Math.min(activeIndex, stages.length - 1)],
    [activeIndex, stages],
  );

  const progressRatio = activeIndex / Math.max(stages.length - 1, 1);

  useGSAP(() => {
    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      scrub: reducedMotion ? false : 0.35,
      onUpdate: (self) => {
        const nextIndex = Math.min(
          stages.length - 1,
          Math.round(self.progress * (stages.length - 1)),
        );
        setActiveIndex(nextIndex);
        setVisible(self.progress > 0.02 && self.progress < 0.985);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [reducedMotion, stages.length]);

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    refresh();
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  }, []);

  const scrollToStage = (index: number) => {
    const maxScroll = ScrollTrigger.maxScroll(window);
    const target = stages.length <= 1 ? 0 : (index / (stages.length - 1)) * maxScroll;

    if (reducedMotion) {
      window.scrollTo({ top: target, behavior: "auto" });
      return;
    }

    if (lenis) {
      lenis.scrollTo(target, { duration: 1.05 });
      return;
    }

    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <>
      <div
        aria-hidden={!visible}
        className={cn(
          "fixed inset-x-0 top-header z-30 border-b border-border bg-background px-6 py-2 lg:hidden",
          "transition-opacity duration-300 motion-reduce:transition-none",
          visible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex items-center justify-between gap-3 font-mono text-[11px] tracking-wide">
          <span className="text-muted">{progress.label}</span>
          <span className="text-foreground">
            {activeStage?.label} · {activeStage?.detail}
          </span>
        </div>
        <div className="mt-2 h-px w-full bg-border">
          <div
            className="h-px bg-signal transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${progressRatio * 100}%` }}
          />
        </div>
      </div>

      <aside
        aria-label="Request progress through the system"
        aria-hidden={!visible}
        {...(!visible ? { inert: true as const } : {})}
        className={cn(
          "pointer-events-none fixed top-1/2 z-30 hidden -translate-y-1/2 lg:block",
          "right-4 xl:right-6",
          "transition-opacity duration-300 motion-reduce:transition-none",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="pointer-events-auto flex flex-col items-end gap-4 border border-border bg-background px-4 py-4">
          <div className="text-right">
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-muted">
              {progress.label}
            </p>
            <p className="mt-1 font-mono text-xs text-foreground">
              {activeStage?.detail}
            </p>
          </div>

          <ol className="relative flex flex-col items-end">
            <span
              aria-hidden
              className="absolute right-[5px] top-2 bottom-2 w-px bg-border"
            />
            <span
              aria-hidden
              className="absolute right-[5px] top-2 w-px origin-top bg-signal transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{
                height: "calc(100% - 1rem)",
                transform: `scaleY(${progressRatio})`,
              }}
            />

            {stages.map((stage, index) => {
              const active = index === activeIndex;
              const complete = index < activeIndex;

              return (
                <li key={stage.id} className="relative flex items-center gap-3 py-1.5">
                  <button
                    type="button"
                    data-cursor-text="view"
                    onClick={() => scrollToStage(index)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "min-h-9 text-right font-mono text-[11px] tracking-wide transition-colors",
                      active
                        ? "text-foreground"
                        : complete
                          ? "text-muted"
                          : "text-muted/70 hover:text-muted",
                    )}
                  >
                    {stage.label}
                  </button>
                  <span
                    aria-hidden
                    className={cn(
                      "relative z-10 h-2.5 w-2.5 rounded-full border transition-colors",
                      active
                        ? "border-signal bg-signal"
                        : complete
                          ? "border-signal/50 bg-background"
                          : "border-border bg-background",
                    )}
                  />
                </li>
              );
            })}
          </ol>
        </div>
      </aside>
    </>
  );
}
