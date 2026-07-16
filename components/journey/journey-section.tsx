"use client";

import { motion } from "framer-motion";
import { Container, Text } from "@/components/ui";
import type { JourneyContent } from "@/lib/types";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type JourneySectionProps = {
  journey: JourneyContent;
};

export function JourneySection({ journey }: JourneySectionProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section id="journey" className="scroll-mt-24 py-[var(--space-section)]">
      <Container>
        <header className="mb-12 max-w-3xl md:mb-16">
          <Text as="p" variant="label">
            {journey.eyebrow}
          </Text>
          <Text as="h2" variant="heading" className="mt-4">
            {journey.title}
          </Text>
          <Text as="p" variant="muted" className="mt-4 max-w-2xl">
            {journey.description}
          </Text>
        </header>

        <ol className="space-y-10 border-l border-border md:space-y-12">
          {journey.milestones.map((milestone, index) => (
            <motion.li
              key={milestone.id}
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: reducedMotion ? 0 : 0.45,
                delay: reducedMotion ? 0 : index * 0.03,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="pl-8 md:pl-12"
              data-cursor-hover
              data-cursor-text={milestone.date}
            >
              <div className="flex flex-col gap-3 md:flex-row md:gap-10">
                <Text
                  as="p"
                  variant="mono"
                  className="shrink-0 text-muted md:w-28 md:pt-1"
                >
                  {milestone.date}
                </Text>
                <div className="min-w-0">
                  <Text as="h3" variant="title">
                    {milestone.title}
                  </Text>
                  <Text as="p" variant="muted" className="mt-3 max-w-2xl">
                    {milestone.detail}
                  </Text>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
