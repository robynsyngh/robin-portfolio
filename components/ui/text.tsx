import { cn } from "@/lib/utils";

const variants = {
  display:
    "font-sans text-4xl font-medium tracking-tight text-foreground md:text-6xl lg:text-7xl",
  heading:
    "font-sans text-3xl font-medium tracking-tight text-foreground md:text-5xl",
  title: "font-sans text-2xl font-medium tracking-tight text-foreground md:text-3xl",
  body: "font-sans text-base leading-relaxed text-foreground md:text-lg",
  muted: "font-sans text-base leading-relaxed text-muted md:text-lg",
  label: "font-mono text-xs tracking-[0.18em] uppercase text-muted",
  mono: "font-mono text-sm tracking-wide text-muted",
} as const;

type TextOwnProps<T extends React.ElementType> = {
  as?: T;
  variant?: keyof typeof variants;
  className?: string;
  children: React.ReactNode;
};

type TextProps<T extends React.ElementType> = TextOwnProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof TextOwnProps<T>>;

export function Text<T extends React.ElementType = "p">({
  as,
  variant = "body",
  className,
  children,
  ...props
}: TextProps<T>) {
  const Component = as || "p";

  return (
    <Component className={cn(variants[variant], className)} {...props}>
      {children}
    </Component>
  );
}
