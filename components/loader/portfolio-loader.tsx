"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderReadyProvider } from "@/components/loader/loader-ready";
import type { LoaderContent } from "@/lib/types";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useTypingSequence } from "@/hooks/use-typing-sequence";

type PortfolioLoaderProps = {
  loader: LoaderContent;
  children: React.ReactNode;
};

type Phase = "booting" | "typing" | "exiting" | "done";

export function PortfolioLoader({ loader, children }: PortfolioLoaderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<Phase>("booting");

  useEffect(() => {
    const seen = sessionStorage.getItem(loader.sessionKey) === "1";

    if (seen || reducedMotion) {
      setPhase("done");
      return;
    }

    setPhase("typing");
  }, [loader.sessionKey, reducedMotion]);

  useEffect(() => {
    if (phase === "typing" || phase === "booting") {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }

    document.body.style.overflow = "";
  }, [phase]);

  const { completedLines, currentText, done } = useTypingSequence(loader.steps, {
    enabled: phase === "typing",
    charMs: 16,
    linePauseMs: 180,
  });

  useEffect(() => {
    if (phase !== "typing" || !done) {
      return;
    }

    sessionStorage.setItem(loader.sessionKey, "1");
    setPhase("exiting");
  }, [done, loader.sessionKey, phase]);

  const showOverlay = phase === "booting" || phase === "typing";
  const ready = phase === "exiting" || phase === "done";

  return (
    <LoaderReadyProvider ready={ready}>
      <AnimatePresence onExitComplete={() => setPhase("done")}>
        {showOverlay ? (
          <motion.div
            key="portfolio-loader"
            role="dialog"
            aria-modal="true"
            aria-label="Portfolio boot sequence"
            className="fixed inset-0 z-[100] flex items-center bg-background"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto w-full max-w-3xl px-6 md:px-12">
              <p className="font-mono text-xs tracking-[0.22em] uppercase text-muted">
                Boot sequence
              </p>
              <div
                className="mt-8 space-y-2 font-mono text-sm leading-relaxed text-muted md:text-base"
                aria-live="polite"
                aria-busy={phase === "typing"}
              >
                {phase === "booting" ? (
                  <p className="text-foreground/80">Initializing Portfolio...</p>
                ) : (
                  <>
                    {completedLines.map((line) => (
                      <p key={line} className="text-muted">
                        <span className="mr-3 text-foreground/40">›</span>
                        {line}
                      </p>
                    ))}
                    {!done ? (
                      <p className="text-foreground">
                        <span className="mr-3 text-foreground/60">›</span>
                        {currentText}
                        <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 bg-accent align-middle opacity-80" />
                      </p>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div {...(showOverlay ? { inert: true as const } : {})}>{children}</div>
    </LoaderReadyProvider>
  );
}
