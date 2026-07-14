"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useEasterEggs } from "@/components/easter-eggs/easter-egg-context";
import { cn } from "@/lib/utils";

export function RubberDuck() {
  const { easterEggs, duckFound, findDuck } = useEasterEggs();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <button
      type="button"
      aria-label={easterEggs.duck.ariaLabel}
      onClick={findDuck}
      className={cn(
        "fixed bottom-4 right-4 z-[60] h-7 w-7 rounded-sm",
        "opacity-0 transition-opacity duration-300",
        "hover:opacity-40 focus-visible:opacity-55",
        // Stay invisible by default even after unlock — only reveal on hover/focus
        duckFound && "hover:opacity-50 focus-visible:opacity-60",
      )}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden
        className="h-full w-full text-foreground"
      >
        <path
          d="M7 19c0-5 3.5-9 9-9 1.5-3 4-5 7-5 1 2 1 4 0 6 3 1 5 4 5 7 0 5-5 8-12 8S7 24 7 19Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle cx="20.5" cy="14.5" r="1" fill="currentColor" />
        <path d="M23 16h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </button>,
    document.body,
  );
}
