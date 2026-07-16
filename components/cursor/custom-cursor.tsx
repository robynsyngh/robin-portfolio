"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], summary, select, input[type="checkbox"], input[type="radio"], [data-cursor-hover]';

const ACTIVE_CLASS = "custom-cursor-active";
const LERP_POSITION = 0.28;
const LERP_FRAME = 0.32;

function toHex(value: number) {
  return `0x${Math.max(0, Math.round(value)).toString(16).toUpperCase().padStart(3, "0")}`;
}

function resolveLabel(el: Element): string {
  const explicit = el.getAttribute("data-cursor-text");
  if (explicit) return explicit;

  const tag = el.tagName.toLowerCase();

  if (tag === "a") {
    const href = el.getAttribute("href") ?? "";
    const external = el.getAttribute("target") === "_blank" || /^https?:\/\//.test(href);
    return external ? "open ↗" : "view";
  }
  if (tag === "button" || el.getAttribute("role") === "button") return "run";
  if (tag === "summary") return "expand";
  if (tag === "select") return "choose";
  if (tag === "input") return "toggle";
  return "select";
}

type Rect = { x: number; y: number; w: number; h: number };

/**
 * "Inspector" cursor — riffs on the browser devtools element-picker and a
 * debugger's coordinate readout, matching the terminal/dev-mode identity
 * elsewhere in the portfolio. Idle state shows a hex position readout; on
 * hover a bracket-cornered frame snaps to the target's bounding box with a
 * contextual mono label. Disabled for touch devices and reduced motion.
 */
export function CustomCursor() {
  const reducedMotion = usePrefersReducedMotion();
  const dotRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    const tag = tagRef.current;
    const frame = frameRef.current;
    const label = labelRef.current;
    const coords = coordsRef.current;
    if (!dot || !tag || !frame || !label || !coords) return;

    document.documentElement.classList.add(ACTIVE_CLASS);

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let frame_ = 0;

    let hoveredEl: Element | null = null;
    let targetRect: Rect | null = null;
    const currentRect: Rect = { x: 0, y: 0, w: 0, h: 0 };
    let frameVisible = false;
    let lastLabelText = "";
    let lastCoordsText = "";

    let hasPointer = false;

    const applyHit = (hit: Element | null) => {
      if (hit !== hoveredEl) {
        hoveredEl = hit;
        if (hit) {
          const bounds = hit.getBoundingClientRect();
          targetRect = { x: bounds.left, y: bounds.top, w: bounds.width, h: bounds.height };
          const text = resolveLabel(hit);
          if (text !== lastLabelText) {
            lastLabelText = text;
            label.textContent = text;
          }
        } else {
          targetRect = null;
        }
      } else if (hit) {
        const bounds = hit.getBoundingClientRect();
        targetRect = { x: bounds.left, y: bounds.top, w: bounds.width, h: bounds.height };
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      hasPointer = true;
      targetX = event.clientX;
      targetY = event.clientY;
      dot.style.opacity = "1";
      tag.style.opacity = "1";

      const hit = (event.target as Element | null)?.closest(INTERACTIVE_SELECTOR) ?? null;
      applyHit(hit);
    };

    // Scrolling (wheel/trackpad) moves content under a stationary cursor without
    // firing pointermove, so the hovered element/label would otherwise go stale.
    // Re-run the hit test from the last known cursor position whenever the page scrolls.
    const onScroll = () => {
      if (!hasPointer) return;
      const elAtPoint = document.elementFromPoint(targetX, targetY);
      const hit = elAtPoint?.closest(INTERACTIVE_SELECTOR) ?? null;
      applyHit(hit);
    };

    const onPointerDown = (event: PointerEvent) => {
      const blip = document.createElement("span");
      blip.className = "custom-cursor-blip";
      blip.style.left = `${event.clientX}px`;
      blip.style.top = `${event.clientY}px`;
      blip.innerHTML =
        '<span class="ccb-corner ccb-tl"></span><span class="ccb-corner ccb-tr"></span><span class="ccb-corner ccb-bl"></span><span class="ccb-corner ccb-br"></span>';
      document.body.appendChild(blip);
      window.setTimeout(() => blip.remove(), 500);

      const ping = document.createElement("span");
      ping.className = "custom-cursor-ping";
      ping.style.left = `${event.clientX}px`;
      ping.style.top = `${event.clientY}px`;
      document.body.appendChild(ping);
      window.setTimeout(() => ping.remove(), 650);
    };

    const onLeaveWindow = () => {
      dot.style.opacity = "0";
      tag.style.opacity = "0";
      frame.style.opacity = "0";
    };

    const tick = () => {
      x += (targetX - x) * LERP_POSITION;
      y += (targetY - y) * LERP_POSITION;
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      tag.style.transform = `translate(${x}px, ${y}px) translate(1.1rem, 1rem)`;

      const shouldShowFrame = Boolean(targetRect);
      if (shouldShowFrame !== frameVisible) {
        frameVisible = shouldShowFrame;
        frame.style.opacity = frameVisible ? "1" : "0";
        label.style.opacity = frameVisible ? "1" : "0";
        coords.style.opacity = frameVisible ? "0" : "1";
      }

      if (targetRect) {
        currentRect.x += (targetRect.x - currentRect.x) * LERP_FRAME;
        currentRect.y += (targetRect.y - currentRect.y) * LERP_FRAME;
        currentRect.w += (targetRect.w - currentRect.w) * LERP_FRAME;
        currentRect.h += (targetRect.h - currentRect.h) * LERP_FRAME;
        frame.style.transform = `translate(${currentRect.x}px, ${currentRect.y}px)`;
        frame.style.width = `${currentRect.w}px`;
        frame.style.height = `${currentRect.h}px`;
      } else {
        const coordsText = `${toHex(x)} · ${toHex(y)}`;
        if (coordsText !== lastCoordsText) {
          lastCoordsText = coordsText;
          coords.textContent = coordsText;
        }
      }

      frame_ = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);
    frame_ = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame_);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll, { capture: true });
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
      document.documentElement.classList.remove(ACTIVE_CLASS);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] h-1.5 w-1.5 rounded-full bg-foreground opacity-0 transition-opacity duration-200"
      />
      <div
        ref={tagRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] whitespace-nowrap font-mono text-[10px] tracking-[0.08em] opacity-0 transition-opacity duration-200"
      >
        <span
          ref={coordsRef}
          className="absolute left-0 top-0 text-muted transition-opacity duration-150"
        />
        <span
          ref={labelRef}
          className="absolute left-0 top-0 rounded-[2px] border border-signal/40 bg-surface px-1.5 py-0.5 uppercase text-signal opacity-0 transition-opacity duration-150"
        />
      </div>
      <div ref={frameRef} aria-hidden className="custom-cursor-frame">
        <span className="ccf-corner ccf-tl" />
        <span className="ccf-corner ccf-tr" />
        <span className="ccf-corner ccf-bl" />
        <span className="ccf-corner ccf-br" />
      </div>
    </>
  );
}
