"use client";

import { motion } from "framer-motion";
import { Button, Container, Text } from "@/components/ui";
import type { ContactContent, Profile } from "@/lib/types";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type ContactSectionProps = {
  contact: ContactContent;
  profile: Profile;
};

export function ContactSection({ contact, profile }: ContactSectionProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section id="contact" className="scroll-mt-24 py-[var(--space-section)]">
      <Container>
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl border-t border-border pt-12 lg:pt-16"
        >
          <Text as="p" variant="label">
            {contact.eyebrow}
          </Text>
          <Text as="h2" variant="heading" className="mt-4">
            {contact.title}
          </Text>
          <Text as="p" variant="muted" className="mt-5">
            {contact.description}
          </Text>

          <div className="mt-8 inline-flex items-center gap-3 border border-border px-3 py-2">
            <span className="relative flex h-1.5 w-1.5" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            <Text as="p" variant="mono" className="text-foreground">
              {contact.availability}
            </Text>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={`mailto:${profile.email}`} variant="primary">
              {contact.ctaLabel}
            </Button>
            <Button href="/resume" variant="secondary">
              Resume
            </Button>
          </div>

          <Text as="p" variant="muted" className="mt-8 max-w-md text-sm md:text-base">
            {contact.note}
          </Text>
        </motion.div>
      </Container>
    </section>
  );
}
