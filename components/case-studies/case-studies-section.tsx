import { Badge, Container, Text, TextLink } from "@/components/ui";
import type { CaseStudy, Project } from "@/lib/types";

type CaseStudiesSectionProps = {
  caseStudies: CaseStudy[];
  projects: Project[];
};

export function CaseStudiesSection({
  caseStudies,
  projects,
}: CaseStudiesSectionProps) {
  const projectMap = Object.fromEntries(projects.map((project) => [project.id, project]));

  return (
    <section id="case-studies" className="scroll-mt-24 py-[var(--space-section)]">
      <Container>
        <header className="mb-12 max-w-3xl md:mb-16">
          <Text as="p" variant="label">
            Case Studies
          </Text>
          <Text as="h2" variant="heading" className="mt-4">
            Decisions that mattered in production.
          </Text>
          <Text as="p" variant="muted" className="mt-4 max-w-2xl">
            Stripe, queues, caching, AI boundaries, and the fee/document edge cases
            that only show up after real traffic.
          </Text>
        </header>

        <ul className="border-t border-border">
          {caseStudies.map((study, index) => (
            <li key={study.slug} className="border-b border-border">
              <TextLink
                href={`/case-studies/${study.slug}`}
                className="group grid gap-6 py-8 no-underline transition-opacity md:grid-cols-[5rem_minmax(0,1fr)_minmax(0,0.9fr)] md:gap-10 md:py-10"
              >
                <Text
                  as="span"
                  variant="mono"
                  className="text-muted transition-colors group-hover:text-foreground"
                >
                  {String(index + 1).padStart(2, "0")}
                </Text>

                <div>
                  <Text
                    as="h3"
                    variant="title"
                    className="transition-opacity group-hover:opacity-80"
                  >
                    {study.title}
                  </Text>
                  <Text as="p" variant="mono" className="mt-3 text-foreground/80">
                    {study.subtitle}
                  </Text>
                  <Text as="p" variant="muted" className="mt-4 max-w-xl">
                    {study.summary}
                  </Text>
                </div>

                <div className="md:pt-1">
                  <Text as="p" variant="label">
                    Projects
                  </Text>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {study.projectIds.map((projectId) => (
                      <Badge key={projectId} className="bg-transparent">
                        {projectMap[projectId]?.title ?? projectId}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-6 font-mono text-xs tracking-wide text-muted transition-colors group-hover:text-foreground">
                    Read case study →
                  </p>
                </div>
              </TextLink>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
