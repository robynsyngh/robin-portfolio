import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-border bg-surface px-2.5 py-1",
        "font-mono text-xs tracking-wide text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
