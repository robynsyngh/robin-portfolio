"use client";

import { motion } from "framer-motion";
import { ProjectItem } from "@/components/projects/project-item";
import { Container, Text } from "@/components/ui";
import type { CaseStudy, Project } from "@/lib/types";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type ProjectsSectionProps = {
  projects: Project[];
  caseStudies: CaseStudy[];
};

export function ProjectsSection({ projects, caseStudies }: ProjectsSectionProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section id="projects" className="scroll-mt-24 py-[var(--space-section)]">
      <Container>
        <header className="mb-12 max-w-3xl md:mb-16">
          <Text as="p" variant="label">
            Projects
          </Text>
          <Text as="h2" variant="heading" className="mt-4">
            Systems shipped in production and built with intent.
          </Text>
          <Text as="p" variant="muted" className="mt-4 max-w-2xl">
            FinTech, AI platforms, and focused personal systems — with architecture
            notes and lessons attached.
          </Text>
        </header>

        <div className="border-b border-border">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={reducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: reducedMotion ? 0 : 0.5,
                delay: reducedMotion ? 0 : index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <ProjectItem
                project={project}
                index={index}
                caseStudies={caseStudies.filter((study) =>
                  project.caseStudySlugs?.includes(study.slug),
                )}
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
