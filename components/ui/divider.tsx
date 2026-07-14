import { cn } from "@/lib/utils";

type DividerProps = {
  className?: string;
};

export function Divider({ className }: DividerProps) {
  return <div role="separator" className={cn("h-px w-full bg-border", className)} />;
}
