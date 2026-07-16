"use client";

import { forwardRef, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge, Container, Text } from "@/components/ui";
import type { Skill, SkillsContent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type SkillsSectionProps = {
  skills: SkillsContent;
};

const ease = [0.22, 1, 0.36, 1] as const;

const SkillTab = forwardRef<
  HTMLButtonElement,
  {
    skill: Skill;
    selected: boolean;
    onSelect: () => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  }
>(function SkillTab({ skill, selected, onSelect, onKeyDown }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      data-cursor-text="view"
      id={`skill-tab-${skill.id}`}
      aria-selected={selected}
      aria-controls="skill-panel"
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex items-center gap-2 rounded-sm border px-4 py-2.5 font-mono text-sm tracking-wide transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal",
        selected
          ? "border-signal bg-surface text-foreground"
          : "border-border text-muted hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {skill.name}
      <span className={cn("text-xs", selected ? "text-foreground/60" : "text-muted/70")}>
        {skill.years}y
      </span>
    </button>
  );
});

export function SkillsSection({ skills }: SkillsSectionProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [selectedId, setSelectedId] = useState(skills.items[0]?.id ?? "");
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const selectedIndex = Math.max(
    skills.items.findIndex((skill) => skill.id === selectedId),
    0,
  );
  const selected = skills.items[selectedIndex];

  const focusTab = (index: number) => {
    const target = skills.items[index];
    if (!target) return;
    setSelectedId(target.id);
    tabRefs.current.get(target.id)?.focus();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTab((selectedIndex + 1) % skills.items.length);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTab((selectedIndex - 1 + skills.items.length) % skills.items.length);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(skills.items.length - 1);
        break;
      default:
        break;
    }
  };

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

        <div
          role="tablist"
          aria-label={skills.title}
          className="flex flex-wrap gap-2"
        >
          {skills.items.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{
                duration: reducedMotion ? 0 : 0.35,
                delay: reducedMotion ? 0 : index * 0.03,
                ease,
              }}
            >
              <SkillTab
                ref={(node) => {
                  if (node) {
                    tabRefs.current.set(skill.id, node);
                  } else {
                    tabRefs.current.delete(skill.id);
                  }
                }}
                skill={skill}
                selected={skill.id === selectedId}
                onSelect={() => setSelectedId(skill.id)}
                onKeyDown={onKeyDown}
              />
            </motion.div>
          ))}
        </div>

        <div
          id="skill-panel"
          role="tabpanel"
          aria-labelledby={selected ? `skill-tab-${selected.id}` : undefined}
          className="mt-8 border border-border bg-surface p-6 md:p-8"
        >
          <AnimatePresence mode="wait" initial={false}>
            {selected ? (
              <motion.div
                key={selected.id}
                initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: reducedMotion ? 0 : 0.22, ease }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <Text as="h3" variant="title">
                    {selected.name}
                  </Text>
                  <Text as="p" variant="mono" className="text-foreground/70">
                    {selected.years} years in production
                  </Text>
                </div>
                <Text as="p" variant="muted" className="mt-3 max-w-2xl">
                  {selected.overview}
                </Text>

                <div className="mt-8 grid gap-8 border-t border-border pt-8 md:grid-cols-2">
                  <div>
                    <Text as="p" variant="label">
                      Production usage
                    </Text>
                    <Text as="p" variant="muted" className="mt-3">
                      {selected.productionUsage}
                    </Text>
                    <Text as="p" variant="label" className="mt-6">
                      Challenges
                    </Text>
                    <Text as="p" variant="muted" className="mt-3">
                      {selected.challenges}
                    </Text>
                  </div>
                  <div>
                    <Text as="p" variant="label">
                      Favorite use
                    </Text>
                    <Text as="p" variant="muted" className="mt-3">
                      {selected.favoriteUse}
                    </Text>
                    <Text as="p" variant="label" className="mt-6">
                      Projects
                    </Text>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.projects.map((project) => (
                        <Badge key={project}>{project}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
