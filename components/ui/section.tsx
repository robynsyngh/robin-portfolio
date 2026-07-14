import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  narrow?: boolean;
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  containerClassName,
  narrow = false,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 py-[var(--space-section)]", className)}
    >
      <Container narrow={narrow} className={containerClassName}>
        {(eyebrow || title || description) && (
          <header className="mb-12 max-w-3xl md:mb-16">
            {eyebrow ? (
              <Text as="p" variant="label">
                {eyebrow}
              </Text>
            ) : null}
            {title ? (
              <Text as="h2" variant="heading" className={cn(eyebrow && "mt-4")}>
                {title}
              </Text>
            ) : null}
            {description ? (
              <Text as="p" variant="muted" className="mt-4 max-w-2xl">
                {description}
              </Text>
            ) : null}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
