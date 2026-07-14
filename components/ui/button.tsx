import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "border border-accent bg-accent text-background hover:bg-accent/90 hover:border-accent/90",
  secondary:
    "border border-border bg-transparent text-foreground hover:border-accent/40 hover:bg-accent/5",
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

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-mono tracking-wide transition-colors duration-200",
    "disabled:pointer-events-none disabled:opacity-40",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
    variants[variant],
    sizes[size],
    className,
  );

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
