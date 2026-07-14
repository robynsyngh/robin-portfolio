"use client";

import { motion } from "framer-motion";
import { Container, Text } from "@/components/ui";
import type { AchievementsContent } from "@/lib/types";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type AchievementsSectionProps = {
  achievements: AchievementsContent;
};

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section id="achievements" className="scroll-mt-24 py-[var(--space-section)]">
      <Container>
        <header className="mb-12 max-w-3xl md:mb-16">
          <Text as="p" variant="label">
            {achievements.eyebrow}
          </Text>
          <Text as="h2" variant="heading" className="mt-4">
            {achievements.title}
          </Text>
          <Text as="p" variant="muted" className="mt-4 max-w-2xl">
            {achievements.description}
          </Text>
        </header>

        <ul className="grid border-l border-t border-border md:grid-cols-2 xl:grid-cols-3">
          {achievements.items.map((item, index) => (
            <motion.li
              key={item.id}
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: reducedMotion ? 0 : 0.45,
                delay: reducedMotion ? 0 : index * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group border-b border-r border-border"
            >
              <article className="flex h-full min-h-[14rem] flex-col justify-between p-6 md:p-8 lg:min-h-[16rem]">
                <div className="flex items-start justify-between gap-4">
                  <Text as="p" variant="mono" className="text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                  <Text
                    as="p"
                    variant="label"
                    className="text-right transition-colors group-hover:text-foreground"
                  >
                    {item.label}
                  </Text>
                </div>

                <div className="mt-10">
                  <p className="font-sans text-4xl font-medium tracking-tight text-foreground md:text-5xl">
                    {item.value}
                  </p>
                  <Text as="p" variant="mono" className="mt-2 text-foreground/80">
                    {item.detail}
                  </Text>
                  <Text as="p" variant="muted" className="mt-4 max-w-sm text-base">
                    {item.description}
                  </Text>
                </div>
              </article>
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
