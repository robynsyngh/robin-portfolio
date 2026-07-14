import dynamic from "next/dynamic";
import { AchievementsSection } from "@/components/achievements/achievements-section";
import { CaseStudiesSection } from "@/components/case-studies/case-studies-section";
import { ContactSection } from "@/components/contact/contact-section";
import { Hero } from "@/components/hero/hero";
import { JourneySection } from "@/components/journey/journey-section";
import { ProjectsSection } from "@/components/projects/projects-section";
import { SkillsSection } from "@/components/skills/skills-section";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getAchievements,
  getArchitecture,
  getCaseStudies,
  getContact,
  getEasterEggs,
  getExperience,
  getHero,
  getJourney,
  getProfile,
  getProjects,
  getSkills,
  getTerminal,
} from "@/lib/content";
import { breadcrumbJsonLd } from "@/lib/seo";

const ArchitectureSection = dynamic(
  () =>
    import("@/components/architecture/architecture-section").then(
      (module) => module.ArchitectureSection,
    ),
  {
    loading: () => (
      <section
        id="architecture"
        className="min-h-svh py-[var(--space-section)]"
        aria-hidden
      />
    ),
  },
);

const PortfolioTerminal = dynamic(
  () =>
    import("@/components/terminal/portfolio-terminal").then(
      (module) => module.PortfolioTerminal,
    ),
  {
    loading: () => (
      <section
        id="terminal"
        className="min-h-[28rem] py-[var(--space-section)]"
        aria-hidden
      />
    ),
  },
);

export default function HomePage() {
  const profile = getProfile();
  const hero = getHero();
  const journey = getJourney();
  const architecture = getArchitecture();
  const projects = getProjects();
  const caseStudies = getCaseStudies();
  const skills = getSkills();
  const experience = getExperience();
  const terminal = getTerminal();
  const easterEggs = getEasterEggs();
  const achievements = getAchievements();
  const contact = getContact();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([{ name: "Home", path: "/" }], profile)}
      />

      <Hero profile={profile} hero={hero} />
      <JourneySection journey={journey} />
      <SkillsSection skills={skills} />
      <ProjectsSection projects={projects} caseStudies={caseStudies} />
      <ArchitectureSection architecture={architecture} />
      <CaseStudiesSection caseStudies={caseStudies} projects={projects} />
      <PortfolioTerminal
        context={{
          terminal,
          easterEggs,
          profile,
          projects,
          skills,
          experience,
          architecture,
        }}
      />
      <AchievementsSection achievements={achievements} />
      <ContactSection contact={contact} profile={profile} />
    </>
  );
}
