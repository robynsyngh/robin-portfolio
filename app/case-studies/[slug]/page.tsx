import { notFound } from "next/navigation";
import { Badge, Container, Stack, Text, TextLink } from "@/components/ui";
import { BackLink } from "@/components/case-studies/back-link";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getCaseStudies,
  getCaseStudyBySlug,
  getProfile,
  getProjectById,
} from "@/lib/content";
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  caseStudyJsonLd,
} from "@/lib/seo";
import type { Project } from "@/lib/types";

type CaseStudyPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCaseStudies().map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    return {};
  }

  return buildPageMetadata({
    title: `${study.title} Case Study`,
    description: study.summary,
    path: `/case-studies/${study.slug}`,
    type: "article",
  });
}

function DetailList({
  label,
  items,
}: {
  label: string;
  items: string[];
}) {
  return (
    <div className="border-t border-border pt-8">
      <Text as="h2" variant="label">
        {label}
      </Text>
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2.5 h-px w-4 shrink-0 bg-border" />
            <Text as="p" variant="muted">
              {item}
            </Text>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    notFound();
  }

  const profile = getProfile();
  const relatedProjects = study.projectIds
    .map((id) => getProjectById(id))
    .filter((project): project is Project => Boolean(project));

  return (
    <>
      <JsonLd
        data={[
          caseStudyJsonLd(study, profile),
          breadcrumbJsonLd(
            [
              { name: "Home", path: "/" },
              { name: "Case Studies", path: "/#case-studies" },
              { name: study.title, path: `/case-studies/${study.slug}` },
            ],
            profile,
          ),
        ]}
      />

      <div className="py-[var(--space-section)]">
        <Container narrow>
          <Stack gap="lg">
            <div>
              <BackLink
                fallbackHref="/#case-studies"
                className="font-mono text-xs tracking-wide"
              >
                ← Case Studies
              </BackLink>

              <Text as="p" variant="label" className="mt-10">
                Case Study
              </Text>
              <Text as="h1" variant="heading" className="mt-4">
                {study.title}
              </Text>
              <Text as="p" variant="mono" className="mt-4 text-foreground/80">
                {study.subtitle}
              </Text>
              <Text as="p" variant="muted" className="mt-6">
                {study.summary}
              </Text>

              <div className="mt-8 flex flex-wrap gap-2">
                {relatedProjects.map((project) => (
                  <Badge key={project.id} className="bg-transparent">
                    {project.title}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="border-t border-border pt-8">
                <Text as="h2" variant="label">
                  Problem
                </Text>
                <Text as="p" variant="muted" className="mt-5">
                  {study.problem}
                </Text>
              </div>

              <div className="border-t border-border pt-8">
                <Text as="h2" variant="label">
                  Approach
                </Text>
                <Text as="p" variant="muted" className="mt-5">
                  {study.approach}
                </Text>
              </div>

              <DetailList label="Architecture" items={study.architecture} />
              <DetailList label="Lessons" items={study.lessons} />
              <DetailList label="Outcomes" items={study.outcomes} />
            </div>

            {relatedProjects.length > 0 ? (
              <div className="border-t border-border pt-8">
                <Text as="h2" variant="label">
                  Related projects
                </Text>
                <ul className="mt-5 space-y-4">
                  {relatedProjects.map((project) => (
                    <li key={project.id}>
                      <TextLink
                        href="/#projects"
                        className="font-mono text-sm tracking-wide no-underline text-muted hover:text-foreground"
                      >
                        {project.title}
                      </TextLink>
                      <Text as="p" variant="muted" className="mt-2 text-base">
                        {project.summary}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Stack>
        </Container>
      </div>
    </>
  );
}
