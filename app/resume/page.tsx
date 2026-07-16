import { BackLink } from "@/components/case-studies/back-link";
import { ResumeActions } from "@/components/resume/resume-actions";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge, Container, Stack, Text } from "@/components/ui";
import {
  getAchievements,
  getExperience,
  getProfile,
  getSkills,
} from "@/lib/content";
import { breadcrumbJsonLd, buildPageMetadata, personJsonLd } from "@/lib/seo";

export function generateMetadata() {
  const profile = getProfile();

  return buildPageMetadata({
    title: `Resume — ${profile.name}`,
    description: profile.summary,
    path: "/resume",
  });
}

function formatMonthYear(value: string) {
  if (value === "Present") return value;

  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;

  return new Date(year, month - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function ResumePage() {
  const profile = getProfile();
  const experience = getExperience();
  const skills = getSkills();
  const achievements = getAchievements();

  const topSkills = [...skills.items].sort((a, b) => b.years - a.years);

  return (
    <>
      <JsonLd
        data={[
          personJsonLd(profile),
          breadcrumbJsonLd(
            [
              { name: "Home", path: "/" },
              { name: "Resume", path: "/resume" },
            ],
            profile,
          ),
        ]}
      />

      <div className="py-[var(--space-section)] print:py-0">
        <Container narrow className="print:max-w-none">
          <Stack gap="lg">
            <div className="print:hidden">
              <BackLink fallbackHref="/" className="font-mono text-xs tracking-wide">
                ← Home
              </BackLink>
            </div>

            <header className="border-b border-border pb-8 print:border-none print:pb-4">
              <Text as="p" variant="label" className="print:hidden">
                Resume
              </Text>
              <Text as="h1" variant="heading" className="mt-4 print:mt-0 print:text-2xl">
                {profile.name}
              </Text>
              <Text as="p" variant="mono" className="mt-2 text-foreground/80">
                {profile.title} · {profile.experienceYears} · {profile.location}
              </Text>
              <Text as="p" variant="muted" className="mt-5 max-w-2xl">
                {profile.summary}
              </Text>

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tracking-wide text-muted">
                <span>{profile.email}</span>
                {profile.social.map((item) => (
                  <span key={item.href}>{item.label}</span>
                ))}
              </div>

              <div className="mt-8">
                <ResumeActions
                  resumePath={profile.resumePath}
                  fileName={`${profile.name.replace(/\s+/g, "-")}-Resume.pdf`}
                />
              </div>
            </header>

            <section>
              <Text as="h2" variant="label">
                Experience
              </Text>
              <div className="mt-6 space-y-8">
                {experience.map((item) => (
                  <article
                    key={item.id}
                    className="border-t border-border pt-6 print:border-border/60"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <Text as="h3" variant="title" className="print:text-lg">
                        {item.role}
                      </Text>
                      <Text as="p" variant="mono" className="text-muted">
                        {formatMonthYear(item.start)} — {formatMonthYear(item.end)}
                      </Text>
                    </div>
                    <Text as="p" variant="mono" className="mt-1 text-foreground/80">
                      {item.company}
                    </Text>
                    <Text as="p" variant="muted" className="mt-3 max-w-2xl">
                      {item.summary}
                    </Text>
                    <ul className="mt-4 space-y-2">
                      {item.highlights.map((highlight) => (
                        <li key={highlight} className="flex gap-3">
                          <span className="mt-2.5 h-px w-3 shrink-0 bg-border" />
                          <Text as="p" variant="muted" className="text-base">
                            {highlight}
                          </Text>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section className="border-t border-border pt-8">
              <Text as="h2" variant="label">
                Skills
              </Text>
              <ul className="mt-5 flex flex-wrap gap-2">
                {topSkills.map((skill) => (
                  <li key={skill.id}>
                    <Badge className="bg-transparent">
                      {skill.name}
                      <span className="ml-1.5 text-muted/70">{skill.years}y</span>
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-t border-border pt-8">
              <Text as="h2" variant="label">
                Achievements
              </Text>
              <ul className="mt-5 grid gap-6 sm:grid-cols-2 print:grid-cols-3">
                {achievements.items.map((item) => (
                  <li key={item.id}>
                    <p className="font-sans text-2xl font-medium tracking-tight text-foreground">
                      {item.value}
                    </p>
                    <Text as="p" variant="mono" className="mt-1 text-foreground/80">
                      {item.label} · {item.detail}
                    </Text>
                  </li>
                ))}
              </ul>
            </section>
          </Stack>
        </Container>
      </div>
    </>
  );
}
