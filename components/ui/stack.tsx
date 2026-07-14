import { cn } from "@/lib/utils";

type StackProps = {
  children: React.ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg";
};

const gaps = {
  sm: "gap-3",
  md: "gap-6",
  lg: "gap-10",
} as const;

export function Stack({ children, className, gap = "md" }: StackProps) {
  return <div className={cn("flex flex-col", gaps[gap], className)}>{children}</div>;
}
