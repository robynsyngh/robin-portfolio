"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container, Text } from "@/components/ui";
import type { ArchitectureContent, ArchitectureNode } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useGSAP, ScrollTrigger } from "@/hooks/use-gsap";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type ArchitectureSectionProps = {
  architecture: ArchitectureContent;
};

function DetailBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-t border-border pt-5">
      <Text as="p" variant="label">
        {label}
      </Text>
      <Text as="p" variant="muted" className="mt-3 text-base">
        {value}
      </Text>
    </div>
  );
}

export function ArchitectureSection({ architecture }: ArchitectureSectionProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const nodes = architecture.nodes;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section || !isDesktop) {
        return;
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: reducedMotion ? false : 0.4,
        onUpdate: (self) => {
          const nextIndex = Math.min(
            nodes.length - 1,
            Math.floor(self.progress * nodes.length),
          );
          setScrollIndex(nextIndex);
        },
      });

      return () => {
        trigger.kill();
      };
    },
    { dependencies: [nodes.length, reducedMotion, isDesktop], revertOnUpdate: true },
  );

  const activeNode: ArchitectureNode = useMemo(() => {
    if (selectedId) {
      return nodes.find((node) => node.id === selectedId) ?? nodes[0];
    }

    if (hoveredId) {
      return nodes.find((node) => node.id === hoveredId) ?? nodes[scrollIndex];
    }

    return nodes[Math.min(scrollIndex, nodes.length - 1)];
  }, [hoveredId, nodes, scrollIndex, selectedId]);

  const activeIndex = nodes.findIndex((node) => node.id === activeNode.id);
  const progress = (Math.max(activeIndex, 0) + 1) / nodes.length;

  return (
    <section
      id="architecture"
      ref={sectionRef}
      className="architecture-section scroll-mt-24 py-[var(--space-section)] lg:py-0"
      style={
        {
          "--arch-h": `${Math.max(nodes.length * 42, 220)}vh`,
        } as React.CSSProperties
      }
    >
      <div className="lg:sticky lg:top-0 lg:flex lg:min-h-svh lg:items-center lg:overflow-y-auto lg:py-[var(--space-section)]">
        <Container className="w-full">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-16 xl:gap-20">
            <div>
              <Text as="p" variant="label">
                {architecture.eyebrow}
              </Text>
              <Text as="h2" variant="heading" className="mt-4 max-w-xl">
                {architecture.title}
              </Text>
              <Text as="p" variant="muted" className="mt-4 max-w-xl">
                {architecture.description}
              </Text>

              <nav aria-label="System architecture flow" className="mt-10">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <p className="font-mono text-xs tracking-wide text-muted">
                    Request path
                  </p>
                  <p className="font-mono text-xs tracking-wide text-foreground">
                    {String(Math.max(activeIndex, 0) + 1).padStart(2, "0")} /{" "}
                    {String(nodes.length).padStart(2, "0")}
                  </p>
                </div>

                <div className="mb-8 h-px w-full bg-border">
                  <div
                    className="h-px bg-signal transition-[width] duration-300 ease-out motion-reduce:transition-none"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>

                <ol className="relative space-y-0">
                  <span
                    aria-hidden
                    className="absolute left-[7px] top-2 bottom-2 w-px bg-border"
                  />
                  <span
                    aria-hidden
                    className="absolute left-[7px] top-2 w-px origin-top bg-signal transition-transform duration-300 ease-out motion-reduce:transition-none"
                    style={{
                      height: "calc(100% - 1rem)",
                      transform: `scaleY(${Math.max(activeIndex, 0) / Math.max(nodes.length - 1, 1)})`,
                    }}
                  />

                  {nodes.map((node, index) => {
                    const active = node.id === activeNode.id;
                    const passed = index <= Math.max(activeIndex, scrollIndex);

                    return (
                      <li key={node.id}>
                        <button
                          type="button"
                          data-cursor-text="view details"
                          aria-current={active ? "step" : undefined}
                          onMouseEnter={() => setHoveredId(node.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onFocus={() => setHoveredId(node.id)}
                          onBlur={() => setHoveredId(null)}
                          onClick={() => {
                            setSelectedId(node.id);
                            setScrollIndex(index);
                          }}
                          className={cn(
                            "group flex min-h-11 w-full items-center gap-4 py-2.5 text-left transition-colors",
                            active ? "text-foreground" : "text-muted",
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "relative z-10 h-3.5 w-3.5 shrink-0 rounded-full border transition-colors",
                              active
                                ? "border-signal bg-signal"
                                : passed
                                  ? "border-signal/55 bg-background"
                                  : "border-border bg-background",
                            )}
                          />
                          <span className="flex min-w-0 flex-1 items-baseline justify-between gap-4">
                            <span
                              className={cn(
                                "font-mono text-sm tracking-wide transition-colors",
                                active
                                  ? "text-foreground"
                                  : "text-muted group-hover:text-foreground",
                              )}
                            >
                              {node.label}
                            </span>
                            <span className="font-mono text-[10px] tracking-[0.18em] text-muted">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>

            <div className="lg:sticky lg:top-[22vh]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNode.id}
                  role="region"
                  aria-live="polite"
                  aria-label={`${activeNode.label} details`}
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="border border-border bg-surface p-6 md:p-8"
                >
                  <Text as="p" variant="label">
                    Active node
                  </Text>
                  <Text as="h3" variant="title" className="mt-3">
                    {activeNode.label}
                  </Text>
                  <Text as="p" variant="muted" className="mt-4">
                    {activeNode.story}
                  </Text>

                  <div className="mt-8 space-y-5">
                    <DetailBlock label="Purpose" value={activeNode.purpose} />
                    <DetailBlock label="Usage" value={activeNode.usage} />
                    <DetailBlock label="Challenges" value={activeNode.challenges} />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
