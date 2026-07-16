"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type AnimatedNumberProps = {
  value: string;
  className?: string;
};

type ParsedValue = {
  sign: string;
  target: number;
  decimals: number;
  suffix: string;
  hasComma: boolean;
};

function parseValue(raw: string): ParsedValue | null {
  const match = raw.match(/^([+-]?)([\d,]*\.?\d+)(.*)$/);
  if (!match) return null;

  const [, sign, numPart, suffix] = match;
  const decimals = numPart.includes(".") ? numPart.split(".")[1]?.length ?? 0 : 0;
  const hasComma = numPart.includes(",");
  const target = Number.parseFloat(numPart.replace(/,/g, ""));
  if (Number.isNaN(target)) return null;

  return { sign, target, decimals, suffix, hasComma };
}

function formatValue(current: number, parsed: ParsedValue) {
  const rounded =
    parsed.decimals > 0 ? current.toFixed(parsed.decimals) : Math.round(current).toString();

  const formatted = parsed.hasComma
    ? Number(rounded).toLocaleString("en-US", {
        minimumFractionDigits: parsed.decimals,
        maximumFractionDigits: parsed.decimals,
      })
    : rounded;

  return `${parsed.sign}${formatted}${parsed.suffix}`;
}

/** Counts up from 0 to the parsed numeric value once it scrolls into view. */
export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const parsed = parseValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(
    !parsed || reducedMotion ? value : formatValue(0, parsed),
  );

  useEffect(() => {
    if (!parsed || reducedMotion || !inView) return;

    const controls = animate(0, parsed.target, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(formatValue(latest, parsed)),
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reducedMotion, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
