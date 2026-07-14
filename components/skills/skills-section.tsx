"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge, Container, Text } from "@/components/ui";
import type { Skill, SkillsContent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type SkillsSectionProps = {
  skills: SkillsContent;
};

const ease = [0.22, 1, 0.36, 1] as const;

function SkillItem({
  skill,
  index,
  open,
  onToggle,
  reducedMotion,
}: {
  skill: Skill;
  index: number;
  open: boolean;
  onToggle: () => void;
  reducedMotion: boolean;
}) {
  return (
    <li className="border-b border-border">
      <button
        type="button"
        aria-expanded={open}
        aria-label={`${open ? "Collapse" : "Expand"} ${skill.name}, ${skill.years} years`}
        onClick={onToggle}
        className="group flex w-full items-start gap-4 py-6 text-left md:gap-5 md:py-7"
      >
        <span className="w-8 shrink-0 pt-1 font-mono text-sm tracking-wide text-muted md:w-10">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-4">
            <span className="min-w-0 font-sans text-2xl font-medium tracking-tight text-foreground transition-opacity group-hover:opacity-80 md:text-3xl">
              {skill.name}
              <span className="ml-3 font-mono text-xs font-normal tracking-[0.14em] text-muted">
                · {skill.years} yrs
              </span>
            </span>
            <span
              aria-hidden
              className={cn(
                "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border font-mono text-sm text-muted transition-colors",
                open && "border-accent text-foreground",
              )}
            >
              {open ? "–" : "+"}
            </span>
          </span>
          <span className="mt-3 block max-w-2xl font-sans text-base leading-relaxed text-muted md:text-lg">
            {skill.overview}
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.35, ease }}
            className="overflow-hidden"
          >
            <div className="grid gap-8 border-t border-border pb-8 pl-12 pt-6 md:grid-cols-2 md:pl-[3.75rem]">
              <div>
                <Text as="p" variant="label">
                  Production usage
                </Text>
                <Text as="p" variant="muted" className="mt-3">
                  {skill.productionUsage}
                </Text>
                <Text as="p" variant="label" className="mt-6">
                  Challenges
                </Text>
                <Text as="p" variant="muted" className="mt-3">
                  {skill.challenges}
                </Text>
              </div>
              <div>
                <Text as="p" variant="label">
                  Favorite use
                </Text>
                <Text as="p" variant="muted" className="mt-3">
                  {skill.favoriteUse}
                </Text>
                <Text as="p" variant="label" className="mt-6">
                  Projects
                </Text>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skill.projects.map((project) => (
                    <Badge key={project}>{project}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [openId, setOpenId] = useState<string | null>(skills.items[0]?.id ?? null);

  return (
    <section id="skills" className="scroll-mt-24 py-[var(--space-section)]">
      <Container>
        <header className="mb-12 max-w-3xl md:mb-16">
          <Text as="p" variant="label">
            {skills.eyebrow}
          </Text>
          <Text as="h2" variant="heading" className="mt-4">
            {skills.title}
          </Text>
          <Text as="p" variant="muted" className="mt-4 max-w-2xl">
            {skills.description}
          </Text>
        </header>

        {/* Keep the accordion in the reading column so controls never collide with the field */}
        <ul className="max-w-3xl border-t border-border">
          {skills.items.map((skill, index) => (
            <SkillItem
              key={skill.id}
              skill={skill}
              index={index}
              open={openId === skill.id}
              reducedMotion={reducedMotion}
              onToggle={() =>
                setOpenId((current) => (current === skill.id ? null : skill.id))
              }
            />
          ))}
        </ul>
      </Container>
    </section>
  );
}
