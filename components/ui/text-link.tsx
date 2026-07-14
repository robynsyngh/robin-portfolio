import Link from "next/link";
import { cn } from "@/lib/utils";

type TextLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
  subtle?: boolean;
};

export function TextLink({ className, subtle = false, children, ...props }: TextLinkProps) {
  return (
    <Link
      className={cn(
        "transition-opacity duration-200",
        subtle
          ? "text-muted hover:text-foreground hover:opacity-100"
          : "text-foreground underline decoration-border underline-offset-4 hover:decoration-accent/50",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
