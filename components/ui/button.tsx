"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const variants = {
  primary:
    "border border-accent bg-accent text-background hover:bg-accent/90 hover:border-accent/90",
  secondary:
    "border border-border bg-transparent text-foreground hover:border-signal/50 hover:bg-signal/5",
  ghost: "border border-transparent bg-transparent text-muted hover:text-foreground",
} as const;

const sizes = {
  sm: "min-h-10 px-3 text-xs",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-sm",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.ComponentPropsWithoutRef<typeof Link>, keyof CommonProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const MAGNET_STRENGTH = 0.28;
const MAGNET_MAX = 7;

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const reducedMotion = usePrefersReducedMotion();
  const elementRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const settled = offset.x === 0 && offset.y === 0;

  const handleMouseMove = (event: React.MouseEvent) => {
    if (reducedMotion) return;
    const el = elementRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);

    setOffset({
      x: Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, relX * MAGNET_STRENGTH)),
      y: Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, relY * MAGNET_STRENGTH)),
    });
  };

  const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

  const magnetStyle: React.CSSProperties = reducedMotion
    ? {}
    : {
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: settled
          ? "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)"
          : "transform 0.12s ease-out",
      };

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-mono tracking-wide transition-colors duration-200",
    "disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-signal",
    variants[variant],
    sizes[size],
    className,
  );

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <Link
        ref={elementRef}
        href={href}
        className={classes}
        style={magnetStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...linkProps}
      >
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button
      ref={elementRef}
      className={classes}
      style={magnetStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
