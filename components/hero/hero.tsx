"use client";

import { motion } from "framer-motion";
import { SystemViz } from "@/components/hero/system-viz";
import { useLoaderReady } from "@/components/loader/loader-ready";
import { Badge, Button, Container, Stack, Text } from "@/components/ui";
import type { HeroContent, Profile } from "@/lib/types";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type HeroProps = {
  profile: Profile;
  hero: HeroContent;
};

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ profile, hero }: HeroProps) {
  const ready = useLoaderReady();
  const reducedMotion = usePrefersReducedMotion();

  const item = {
    hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease },
    },
  };

  return (
    <section
      id="home"
      className="relative flex min-h-[calc(100svh-var(--header-height))] flex-col justify-center overflow-hidden py-[var(--space-section)] md:min-h-svh"
    >
      <SystemViz nodes={hero.nodes} links={hero.links} />

      <Container className="relative z-10">
        <motion.div
          initial="hidden"
          animate={ready ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: reducedMotion ? 0 : 0.1,
                delayChildren: reducedMotion ? 0 : 0.05,
              },
            },
          }}
        >
          <Stack gap="lg">
            <motion.div variants={item}>
              <Text
                as="p"
                variant="label"
                className="text-sm tracking-[0.22em] text-foreground md:text-base"
              >
                {profile.name}
              </Text>
            </motion.div>

            <motion.div variants={item}>
              <Text as="h1" variant="display" className="max-w-4xl">
                {profile.headlineLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </Text>
            </motion.div>

            <motion.div variants={item}>
              <Text as="p" variant="muted" className="max-w-xl">
                {profile.title}
              </Text>
            </motion.div>

            <motion.div variants={item} className="flex flex-wrap gap-2">
              {profile.focusAreas.map((area) => (
                <Badge key={area}>{area}</Badge>
              ))}
            </motion.div>

            <motion.div variants={item} className="flex flex-wrap gap-3 pt-2">
              <Button href={hero.exploreHref} variant="primary">
                {hero.exploreLabel}
              </Button>
              <Button href="/resume" variant="secondary">
                {hero.resumeLabel}
              </Button>
              {profile.social.map((itemSocial) => (
                <Button
                  key={itemSocial.href}
                  href={itemSocial.href}
                  variant="ghost"
                  target="_blank"
                  rel="noreferrer"
                >
                  {itemSocial.label}
                </Button>
              ))}
            </motion.div>
          </Stack>
        </motion.div>
      </Container>
    </section>
  );
}
