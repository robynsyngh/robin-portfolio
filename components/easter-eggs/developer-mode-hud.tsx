"use client";

import { useEffect, useState } from "react";
import { useEasterEggs } from "@/components/easter-eggs/easter-egg-context";

type MetricsState = {
  fps: string;
  memory: string;
  workers: string;
  apiCalls: string;
  latency: string;
};

function readMemory() {
  const perf = performance as Performance & {
    memory?: { usedJSHeapSize: number };
  };

  if (perf.memory?.usedJSHeapSize) {
    return `${Math.round(perf.memory.usedJSHeapSize / 1024 / 1024)} MB`;
  }

  return `${(18 + Math.random() * 6).toFixed(1)} MB`;
}

export function DeveloperModeHud() {
  const { developerMode, easterEggs } = useEasterEggs();
  const [metrics, setMetrics] = useState<MetricsState>({
    fps: "—",
    memory: "—",
    workers: "4",
    apiCalls: "0",
    latency: "—",
  });

  useEffect(() => {
    if (!developerMode) {
      return;
    }

    let frames = 0;
    let last = performance.now();
    let raf = 0;
    let apiCalls = 120;

    const tick = (now: number) => {
      frames += 1;
      if (now - last >= 1000) {
        const fps = Math.round((frames * 1000) / (now - last));
        frames = 0;
        last = now;
        apiCalls += Math.floor(Math.random() * 3) + 1;

        setMetrics({
          fps: String(fps),
          memory: readMemory(),
          workers: String(3 + Math.floor(Math.random() * 3)),
          apiCalls: String(apiCalls),
          latency: `${(12 + Math.random() * 28).toFixed(0)} ms`,
        });
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [developerMode]);

  if (!developerMode) {
    return null;
  }

  const values: Record<string, string> = metrics;

  return (
    <aside
      aria-label={easterEggs.developerMode.title}
      className="fixed bottom-6 left-6 z-[70] hidden w-52 border border-border bg-background p-3 font-mono text-[11px] tracking-wide text-muted md:block"
    >
      <p className="text-[10px] tracking-[0.22em] uppercase text-foreground">
        {easterEggs.developerMode.title}
      </p>
      <ul className="mt-3 space-y-2">
        {easterEggs.developerMode.metrics.map((metric) => (
          <li key={metric.id} className="flex items-center justify-between gap-3">
            <span>{metric.label}</span>
            <span className="text-foreground">{values[metric.id] ?? "—"}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
