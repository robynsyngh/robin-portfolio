"use client";

import { motion } from "framer-motion";
import { useLoaderReady } from "@/components/loader/loader-ready";
import type { HeroContent } from "@/lib/types";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type SystemVizProps = {
  nodes: HeroContent["nodes"];
  links: HeroContent["links"];
};

export function SystemViz({ nodes, links }: SystemVizProps) {
  const ready = useLoaderReady();
  const reducedMotion = usePrefersReducedMotion();
  const nodeMap = Object.fromEntries(nodes.map((node) => [node.id, node]));

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 isolate overflow-hidden [contain:paint]"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full opacity-[0.3]"
      >
        <defs>
          <pattern id="hero-grid" width="4" height="4" patternUnits="userSpaceOnUse">
            <path
              d="M 4 0 L 0 0 0 4"
              fill="none"
              stroke="var(--border)"
              strokeWidth="0.15"
            />
          </pattern>
        </defs>

        <rect width="100" height="100" fill="url(#hero-grid)" />

        {links.map(([fromId, toId], index) => {
          const from = nodeMap[fromId];
          const to = nodeMap[toId];

          if (!from || !to) {
            return null;
          }

          const d = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

          return (
            <motion.path
              key={`${fromId}-${toId}`}
              d={d}
              fill="none"
              stroke="var(--foreground)"
              strokeOpacity="0.24"
              strokeWidth="0.2"
              strokeDasharray="1.2 1.4"
              initial={false}
              animate={
                ready
                  ? { pathLength: 1, opacity: 1 }
                  : reducedMotion
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0, opacity: 0 }
              }
              transition={{
                duration: reducedMotion ? 0 : 1.35,
                delay: ready && !reducedMotion ? 0.15 + index * 0.07 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}

        {nodes.map((node, index) => (
          <g
            key={node.id}
            className="pointer-events-auto"
            data-cursor-hover
            data-cursor-text={node.label}
          >
            <motion.rect
              x={node.x - 5.5}
              y={node.y - 3.2}
              width="11"
              height="6.4"
              rx="0.35"
              fill="var(--surface)"
              stroke="var(--border)"
              strokeWidth="0.25"
              initial={false}
              animate={{ opacity: ready || reducedMotion ? 1 : 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.55,
                delay: ready && !reducedMotion ? 0.35 + index * 0.05 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
            <motion.text
              x={node.x}
              y={node.y + 0.8}
              textAnchor="middle"
              fill="var(--muted)"
              fontSize="1.8"
              fontFamily="var(--font-geist-mono), monospace"
              initial={false}
              animate={{ opacity: ready || reducedMotion ? 1 : 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.45,
                delay: ready && !reducedMotion ? 0.45 + index * 0.05 : 0,
              }}
            >
              {node.label}
            </motion.text>
          </g>
        ))}
      </svg>

      <div className="absolute inset-y-0 left-0 w-[58%] bg-background" />
      <div className="absolute inset-y-0 left-[58%] w-[18%] bg-background/70" />
      <div className="absolute inset-y-0 right-0 w-[24%] bg-background/25" />
    </div>
  );
}
