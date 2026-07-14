import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
};

export function Container({ children, className, narrow = false }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 md:px-10 lg:px-14",
        narrow ? "max-w-[var(--prose-max)]" : "max-w-[var(--content-max)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
