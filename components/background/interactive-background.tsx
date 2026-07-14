"use client";

import { useEffect, useRef } from "react";
import type { BackgroundContent, BackgroundNode } from "@/lib/types";
import { ScrollTrigger } from "@/hooks/use-gsap";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type InteractiveBackgroundProps = {
  background: BackgroundContent;
};

type Point = { x: number; y: number };

type RuntimeNode = BackgroundNode & {
  base: Point;
  pos: Point;
  activation: number;
  focus: number;
};

type RuntimeEdge = {
  id: string;
  from: number;
  to: number;
  activation: number;
  focus: number;
};

type Signal = {
  edge: number;
  t: number;
  speed: number;
  reverse: boolean;
  ambient: boolean;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function pointOnSegment(a: Point, b: Point, t: number): Point {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

/**
 * Atmospheric system field.
 * Quiet at rest; progressive disclosure near pointer / on scroll.
 * Visual weight biased away from the reading column.
 */
export function InteractiveBackground({ background }: InteractiveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = true;
    let visible = !document.hidden;
    let lastTime = 0;
    let intro = 0;

    const mono =
      getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() ||
      "ui-monospace, SFMono-Regular, Menlo, monospace";

    const pointer = {
      x: window.innerWidth * 0.9,
      y: window.innerHeight * 0.42,
    };
    const pointerTarget = { ...pointer };
    let pointerActive = false;
    let pointerIdle = 0;

    const scroll = {
      progress: 0,
      direction: 1,
      velocity: 0,
      offsetX: 0,
      offsetY: 0,
      engage: 0,
    };

    const nodes: RuntimeNode[] = background.nodes.map((node) => ({
      ...node,
      base: { x: 0, y: 0 },
      pos: { x: 0, y: 0 },
      activation: 0,
      focus: 0,
    }));

    const nodeIndex = new Map(nodes.map((node, index) => [node.id, index]));

    const adjacency = new Map<number, number[]>();
    const edges: RuntimeEdge[] = background.edges
      .map((edge) => {
        const from = nodeIndex.get(edge.from);
        const to = nodeIndex.get(edge.to);
        if (from === undefined || to === undefined) return null;
        adjacency.set(from, [...(adjacency.get(from) ?? []), to]);
        adjacency.set(to, [...(adjacency.get(to) ?? []), from]);
        return { id: edge.id, from, to, activation: 0, focus: 0 };
      })
      .filter((edge): edge is RuntimeEdge => edge !== null);

    const signals: Signal[] = Array.from({ length: background.signalCount }, (_, i) => ({
      edge: i % Math.max(edges.length, 1),
      t: (i * 0.173) % 1,
      speed: background.baseSignalSpeed * (0.7 + (i % 4) * 0.12),
      reverse: i % 2 === 1,
      ambient: i < 3,
    }));

    const contentWeight = (x: number) => {
      const safe = background.contentSafeLeft * width;
      if (x >= safe) return 1;
      const edge = safe * 0.96;
      if (x <= edge) return 0;
      return lerp(0, 0.35, (x - edge) / (safe - edge || 1));
    };

    const drawContentMask = () => {
      const safe = background.contentSafeLeft * width;
      // Narrow soft edge so the margin field can breathe, copy stays fully covered
      const fade = Math.min(width * 0.08, Math.max(32, width - safe));
      const solidEnd = Math.max(0, safe - fade * 0.35);

      ctx.fillStyle = "rgba(10, 10, 10, 1)";
      ctx.fillRect(0, 0, solidEnd, height);

      const steps = 14;
      for (let i = 0; i < steps; i += 1) {
        const t = i / steps;
        const x0 = solidEnd + (fade * i) / steps;
        const x1 = solidEnd + (fade * (i + 1)) / steps;
        const alpha = 1 - easeOutCubic(t);
        if (alpha < 0.02) continue;
        ctx.fillStyle = `rgba(10, 10, 10, ${alpha})`;
        ctx.fillRect(x0, 0, Math.max(1, x1 - x0 + 0.5), height);
      }
    };

    const layoutNodes = () => {
      for (const node of nodes) {
        node.base.x = node.x * width;
        node.base.y = node.y * height;
        node.pos.x = node.base.x;
        node.pos.y = node.base.y;
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layoutNodes();
    };

    const drawGrid = (influence: Point, radius: number, energy: number) => {
      const cell = background.gridCell;
      const ox = scroll.offsetX * 0.35;
      const oy =
        scroll.offsetY * 0.5 + scroll.progress * height * background.parallaxStrength * -0.22;

      ctx.save();
      ctx.translate(ox % cell, oy % cell);
      ctx.strokeStyle = `rgba(245, 245, 245, ${0.018 + energy * 0.012})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = -cell; x <= width + cell * 2; x += cell) {
        ctx.moveTo(x, -cell);
        ctx.lineTo(x, height + cell);
      }
      for (let y = -cell; y <= height + cell * 2; y += cell) {
        ctx.moveTo(-cell, y);
        ctx.lineTo(width + cell, y);
      }
      ctx.stroke();
      ctx.restore();

      if (energy < 0.08 || isCoarse) return;

      const localCell = cell * 0.5;
      const minX = Math.max(background.contentSafeLeft * width, influence.x - radius);
      const maxX = influence.x + radius;
      const minY = influence.y - radius;
      const maxY = influence.y + radius;

      for (let x = Math.floor(minX / localCell) * localCell; x <= maxX; x += localCell) {
        for (let y = Math.floor(minY / localCell) * localCell; y <= maxY; y += localCell) {
          const cx = x + localCell * 0.5;
          const cy = y + localCell * 0.5;
          const d = dist({ x: cx, y: cy }, influence);
          if (d > radius) continue;

          const local = (1 - d / radius) * energy * contentWeight(cx);
          if (local < 0.06) continue;

          const pull = local * 6;
          const dx = influence.x - cx;
          const dy = influence.y - cy;
          const len = Math.hypot(dx, dy) || 1;

          ctx.strokeStyle = `rgba(245, 245, 245, ${local * 0.22})`;
          ctx.beginPath();
          ctx.moveTo(x + (dx / len) * pull, y + (dy / len) * pull);
          ctx.lineTo(x + localCell, y);
          ctx.moveTo(x + (dx / len) * pull, y + (dy / len) * pull);
          ctx.lineTo(x, y + localCell);
          ctx.stroke();
        }
      }
    };

    const drawFocusRing = (p: Point, radius: number, energy: number) => {
      if (energy < 0.2 || isCoarse) return;

      ctx.strokeStyle = `rgba(245, 245, 245, ${0.04 + energy * 0.06})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius * (0.22 + energy * 0.06), 0, Math.PI * 2);
      ctx.stroke();

      const arm = 8 + energy * 4;
      ctx.strokeStyle = `rgba(245, 245, 245, ${0.08 + energy * 0.1})`;
      ctx.beginPath();
      ctx.moveTo(p.x - arm, p.y);
      ctx.lineTo(p.x - 4, p.y);
      ctx.moveTo(p.x + 4, p.y);
      ctx.lineTo(p.x + arm, p.y);
      ctx.moveTo(p.x, p.y - arm);
      ctx.lineTo(p.x, p.y - 4);
      ctx.moveTo(p.x, p.y + 4);
      ctx.lineTo(p.x, p.y + arm);
      ctx.stroke();
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = background.restOpacity * 0.7;
      drawGrid({ x: width * 0.9, y: height * 0.4 }, background.influenceRadius * 0.3, 0.15);
      for (const edge of edges) {
        const a = nodes[edge.from];
        const b = nodes[edge.to];
        if (!a || !b) continue;
        const w = contentWeight((a.base.x + b.base.x) * 0.5);
        if (w < 0.35) continue;
        ctx.strokeStyle = `rgba(245, 245, 245, ${0.07 * w})`;
        ctx.beginPath();
        ctx.moveTo(a.base.x, a.base.y);
        ctx.lineTo(b.base.x, b.base.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      drawContentMask();
    };

    const tick = (time: number) => {
      if (!running) return;
      if (!visible) {
        frame = window.requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min((time - (lastTime || time)) / 1000, 0.033);
      lastTime = time;
      intro = Math.min(1, intro + dt * 0.7);
      const introEase = easeOutCubic(intro);

      pointer.x = lerp(pointer.x, pointerTarget.x, isCoarse ? 0.08 : 0.14);
      pointer.y = lerp(pointer.y, pointerTarget.y, isCoarse ? 0.08 : 0.14);

      if (pointerActive) {
        pointerIdle = 0;
      } else {
        pointerIdle = Math.min(1, pointerIdle + dt * 0.35);
      }

      const scrollEnergy = clamp(Math.abs(scroll.velocity) / 1400, 0, 1);
      scroll.engage = lerp(scroll.engage, scrollEnergy, 0.08);

      const decorativeFloor = background.contentSafeLeft * width;
      const pointerEnergy = pointerActive
        ? 1
        : clamp(1 - pointerIdle * 1.2, 0.15, 1) * (isCoarse ? 0.35 : 0.55);
      const pointerInDecor = pointer.x >= decorativeFloor;
      // Hover over the reading column must not wake the field
      const decorPointerEnergy = pointerInDecor ? pointerEnergy : 0;
      const energy = clamp(
        0.18 + decorPointerEnergy * 0.35 + scroll.engage * 0.35,
        0.18,
        0.85,
      );

      const targetOffsetX = clamp(
        scroll.velocity * background.velocityInfluence,
        -background.maxVelocityOffset,
        background.maxVelocityOffset,
      );
      const targetOffsetY =
        scroll.direction *
        clamp(
          Math.abs(scroll.velocity) * background.velocityInfluence * 0.55,
          0,
          background.maxVelocityOffset,
        );

      scroll.offsetX = lerp(scroll.offsetX, targetOffsetX, 0.09);
      scroll.offsetY = lerp(scroll.offsetY, targetOffsetY, 0.09);

      const radius = background.influenceRadius * (isCoarse ? 0.7 : 1);
      const cameraY = scroll.progress * height * background.parallaxStrength * -0.18;
      const minNodeX = decorativeFloor + 8;

      // Resolve primary focus node only inside the decorative gutter
      let focusIndex = -1;
      let focusDist = Infinity;
      if (pointerInDecor && (pointerActive || !isCoarse)) {
        for (let i = 0; i < nodes.length; i += 1) {
          const node = nodes[i];
          if (!node) continue;
          const d = dist(
            {
              x: Math.max(minNodeX, node.base.x + scroll.offsetX * 0.1),
              y: node.base.y + cameraY * 0.3,
            },
            pointer,
          );
          if (d < focusDist) {
            focusDist = d;
            focusIndex = i;
          }
        }
        if (focusDist > radius * 0.75) {
          focusIndex = -1;
        }
      }

      const focusNeighbors = new Set<number>();
      if (focusIndex >= 0) {
        focusNeighbors.add(focusIndex);
        for (const n of adjacency.get(focusIndex) ?? []) {
          focusNeighbors.add(n);
        }
      }

      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        if (!node) continue;

        const baseX = Math.max(
          minNodeX,
          node.base.x + scroll.offsetX * (0.08 + node.tier * 0.06),
        );
        const baseY =
          node.base.y + cameraY * (0.25 + node.tier * 0.18) + scroll.offsetY * 0.18;

        const d = dist({ x: baseX, y: baseY }, pointer);
        const near = pointerInDecor ? clamp(1 - d / radius, 0, 1) : 0;
        node.activation = lerp(node.activation, near * decorPointerEnergy, 0.14);

        const wantFocus = focusNeighbors.has(i) ? 1 : 0;
        node.focus = lerp(node.focus, wantFocus, 0.14);

        const magnet =
          pointerInDecor
            ? node.activation * background.magnetStrength * (isCoarse ? 0.3 : 1)
            : 0;
        if (magnet > 0.3) {
          const dx = pointer.x - baseX;
          const dy = pointer.y - baseY;
          const len = Math.hypot(dx, dy) || 1;
          node.pos.x = lerp(node.pos.x, Math.max(minNodeX, baseX + (dx / len) * magnet), 0.12);
          node.pos.y = lerp(node.pos.y, baseY + (dy / len) * magnet, 0.12);
        } else {
          node.pos.x = lerp(node.pos.x, baseX, 0.1);
          node.pos.y = lerp(node.pos.y, baseY, 0.1);
        }

        // Hard clamp — topology cannot drift into copy
        node.pos.x = Math.max(minNodeX, node.pos.x);
      }

      for (const edge of edges) {
        const a = nodes[edge.from];
        const b = nodes[edge.to];
        if (!a || !b) continue;
        edge.activation = lerp(
          edge.activation,
          Math.max(a.activation, b.activation),
          0.16,
        );
        edge.focus = lerp(edge.focus, Math.min(a.focus, b.focus) > 0.4 ? 1 : Math.max(a.focus, b.focus) * 0.65, 0.14);
      }

      const speedBoost = 1 + scroll.engage * 1.4;
      for (const signal of signals) {
        if (!edges.length) continue;
        // Ambient packets always crawl; interactive ones wake with engage
        const active = signal.ambient || scroll.engage > 0.08 || decorPointerEnergy > 0.55;
        if (!active) continue;

        const dir = scroll.direction * (signal.reverse ? -1 : 1);
        const speed = signal.speed * (signal.ambient ? 0.55 : 1) * speedBoost;
        signal.t += dir * speed * dt;
        if (signal.t > 1) {
          signal.t -= 1;
          signal.edge = (signal.edge + 1) % edges.length;
        } else if (signal.t < 0) {
          signal.t += 1;
          signal.edge = (signal.edge - 1 + edges.length) % edges.length;
        }
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = background.restOpacity * introEase;
      drawGrid(pointerInDecor ? pointer : { x: width * 0.94, y: height * 0.45 }, radius, energy);
      ctx.globalAlpha = introEase;

      // Counter-scroll guide lines — only in the decorative margin
      if (scroll.engage > 0.05) {
        ctx.save();
        ctx.globalAlpha = scroll.engage * 0.5 * introEase;
        ctx.translate(-scroll.offsetX * 0.2, cameraY * -0.3 + scroll.offsetY * -0.35);
        for (let i = 0; i < 4; i += 1) {
          const y =
            ((height * (0.18 + i * 0.2) + scroll.progress * height * 0.12 * scroll.direction) %
              (height + 40)) -
            20;
          ctx.strokeStyle = "rgba(245, 245, 245, 0.04)";
          ctx.setLineDash([4, 14]);
          ctx.beginPath();
          ctx.moveTo(decorativeFloor, y);
          ctx.lineTo(width + 10, y + (i % 2 === 0 ? 14 : -14) * scroll.direction);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      }

      for (const edge of edges) {
        const a = nodes[edge.from];
        const b = nodes[edge.to];
        if (!a || !b) continue;

        const midX = (a.pos.x + b.pos.x) * 0.5;
        const weight = contentWeight(midX);
        if (weight < 0.2) continue;

        const boost = 1 + edge.focus * 0.45 + edge.activation * 0.25;
        const alpha = Math.min(
          0.22,
          (0.035 + edge.activation * 0.1 + edge.focus * 0.08) *
            weight *
            background.focusBoost *
            0.7 *
            boost,
        );

        ctx.strokeStyle = `rgba(245, 245, 245, ${alpha})`;
        ctx.lineWidth = 1 + edge.focus * 0.4 + edge.activation * 0.3;
        ctx.beginPath();
        ctx.moveTo(a.pos.x, a.pos.y);
        ctx.lineTo(b.pos.x, b.pos.y);
        ctx.stroke();
      }

      for (const signal of signals) {
        const edge = edges[signal.edge];
        if (!edge) continue;
        const a = nodes[edge.from];
        const b = nodes[edge.to];
        if (!a || !b) continue;

        const p = pointOnSegment(a.pos, b.pos, signal.t);
        const weight = contentWeight(p.x);
        if (weight < 0.45) continue;

        const show =
          signal.ambient || scroll.engage > 0.08 || edge.activation > 0.35 || edge.focus > 0.45;
        if (!show) continue;

        const trailT = clamp(signal.t - 0.04 * scroll.direction, 0, 1);
        const trail = pointOnSegment(a.pos, b.pos, trailT);
        const alpha = Math.min(
          0.28,
          (signal.ambient ? 0.1 : 0.14 + edge.activation * 0.12 + scroll.engage * 0.1) * weight,
        );

        ctx.strokeStyle = `rgba(245, 245, 245, ${alpha * 0.55})`;
        ctx.beginPath();
        ctx.moveTo(trail.x, trail.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        ctx.fillStyle = `rgba(245, 245, 245, ${alpha})`;
        const size = signal.ambient ? 2 : 2.5;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }

      for (const node of nodes) {
        const weight = contentWeight(node.pos.x);
        if (weight < 0.45) continue;

        const active = Math.max(node.activation, node.focus * 0.7);
        const alpha = Math.min(0.35, (0.1 + active * 0.22) * weight);
        const tick = 2.5 + active * 1.5;

        if (active > 0.4 && pointerInDecor) {
          ctx.strokeStyle = `rgba(245, 245, 245, ${0.04 + active * 0.08})`;
          const pad = 5 + active * 2;
          ctx.strokeRect(node.pos.x - pad, node.pos.y - pad, pad * 2, pad * 2);
        }

        ctx.strokeStyle = `rgba(245, 245, 245, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(node.pos.x - tick, node.pos.y);
        ctx.lineTo(node.pos.x + tick, node.pos.y);
        ctx.moveTo(node.pos.x, node.pos.y - tick);
        ctx.lineTo(node.pos.x, node.pos.y + tick);
        ctx.stroke();

        if (node.focus > 0.65 && weight > 0.8 && pointerInDecor && !isCoarse) {
          ctx.font = `10px ${mono}`;
          ctx.fillStyle = `rgba(154, 154, 154, ${0.25 + node.focus * 0.3})`;
          ctx.fillText(node.label, node.pos.x + 8, node.pos.y - 6);
        }
      }

      if (focusIndex >= 0 && pointerActive && pointerInDecor) {
        const focusNode = nodes[focusIndex];
        if (focusNode && contentWeight(focusNode.pos.x) > 0.6) {
          const alpha = clamp(1 - focusDist / (radius * 0.75), 0, 1) * 0.12 * decorPointerEnergy;
          ctx.strokeStyle = `rgba(245, 245, 245, ${alpha})`;
          ctx.setLineDash([2, 6]);
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(focusNode.pos.x, focusNode.pos.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      if (pointerInDecor && pointerActive) {
        drawFocusRing(pointer, radius, decorPointerEnergy * 0.7);
      }

      if (scroll.engage > 0.1) {
        const y = height * 0.52 + scroll.offsetY * 0.35;
        ctx.strokeStyle = `rgba(245, 245, 245, ${scroll.engage * 0.08})`;
        ctx.beginPath();
        ctx.moveTo(decorativeFloor + 8, y);
        ctx.quadraticCurveTo(
          width * 0.94,
          y + scroll.direction * scroll.engage * -28,
          width - 16,
          y,
        );
        ctx.stroke();
      }

      // Final mask — covers any stroke that crossed into copy
      drawContentMask();

      ctx.globalAlpha = 1;
      frame = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerTarget.x = event.clientX;
      pointerTarget.y = event.clientY;
      pointerActive = true;
    };

    const onPointerDown = (event: PointerEvent) => {
      pointerTarget.x = event.clientX;
      pointerTarget.y = event.clientY;
      pointerActive = true;
    };

    const onPointerLeave = () => {
      pointerActive = false;
      pointerTarget.x = width * 0.9;
      pointerTarget.y = height * 0.42;
    };

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) {
        lastTime = 0;
      }
    };

    const trigger = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        scroll.progress = self.progress;
        scroll.direction = self.direction || 1;
        scroll.velocity = self.getVelocity();
      },
    });

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    if (reducedMotion) {
      drawStatic();
    } else {
      frame = window.requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      trigger.kill();
    };
  }, [background, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
