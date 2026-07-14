import { ProjectItem } from "@/components/projects/project-item";
import { Container, Text } from "@/components/ui";
import type { CaseStudy, Project } from "@/lib/types";

type ProjectsSectionProps = {
  projects: Project[];
  caseStudies: CaseStudy[];
};

export function ProjectsSection({ projects, caseStudies }: ProjectsSectionProps) {
  return (
    <section id="projects" className="scroll-mt-24 py-[var(--space-section)]">
      <Container>
        <header className="mb-6 max-w-3xl md:mb-10">
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
            <ProjectItem
              key={project.id}
              project={project}
              index={index}
              caseStudies={caseStudies.filter((study) =>
                project.caseStudySlugs?.includes(study.slug),
              )}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
