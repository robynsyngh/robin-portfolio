import profileData from "@/content/profile.json";
import navigationData from "@/content/navigation.json";
import loaderData from "@/content/loader.json";
import heroData from "@/content/hero.json";
import scrollProgressData from "@/content/scroll-progress.json";
import architectureData from "@/content/architecture.json";
import experienceData from "@/content/experience.json";
import journeyData from "@/content/journey.json";
import projectsData from "@/content/projects.json";
import caseStudiesData from "@/content/case-studies.json";
import skillsData from "@/content/skills.json";
import achievementsData from "@/content/achievements.json";
import contactData from "@/content/contact.json";
import terminalData from "@/content/terminal.json";
import easterEggsData from "@/content/easter-eggs.json";
import blogIndexData from "@/content/blog.json";
import backgroundData from "@/content/background.json";
import type {
  AchievementsContent,
  ArchitectureContent,
  BackgroundContent,
  BlogIndexContent,
  CaseStudy,
  ContactContent,
  EasterEggsContent,
  ExperienceItem,
  HeroContent,
  JourneyContent,
  LoaderContent,
  NavItem,
  Profile,
  Project,
  ScrollProgressContent,
  SkillsContent,
  TerminalContent,
} from "@/lib/types";

const profile = profileData as Profile;
const navigation = navigationData as NavItem[];
const loader = loaderData as LoaderContent;
const hero = heroData as HeroContent;
const scrollProgress = scrollProgressData as ScrollProgressContent;
const architecture = architectureData as ArchitectureContent;
const experience = experienceData as ExperienceItem[];
const journey = journeyData as JourneyContent;
const projects = projectsData as Project[];
const caseStudies = caseStudiesData as CaseStudy[];
const skills = skillsData as SkillsContent;
const achievements = achievementsData as AchievementsContent;
const contact = contactData as ContactContent;
const terminal = terminalData as TerminalContent;
const easterEggs = easterEggsData as EasterEggsContent;
const blogIndex = blogIndexData as BlogIndexContent;
const background = backgroundData as BackgroundContent;

export function getProfile(): Profile {
  return profile;
}

export function getNavigation(): NavItem[] {
  return navigation;
}

export function getLoader(): LoaderContent {
  return loader;
}

export function getHero(): HeroContent {
  return hero;
}

export function getScrollProgress(): ScrollProgressContent {
  return scrollProgress;
}

export function getArchitecture(): ArchitectureContent {
  return architecture;
}

export function getExperience(): ExperienceItem[] {
  return experience;
}

export function getJourney(): JourneyContent {
  return journey;
}

export function getProjects(): Project[] {
  return projects;
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

export function getCaseStudies(): CaseStudy[] {
  return caseStudies;
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

export function getCaseStudiesForProject(projectId: string): CaseStudy[] {
  return caseStudies.filter((study) => study.projectIds.includes(projectId));
}

export function getSkills(): SkillsContent {
  return skills;
}

export function getAchievements(): AchievementsContent {
  return achievements;
}

export function getContact(): ContactContent {
  return contact;
}

export function getTerminal(): TerminalContent {
  return terminal;
}

export function getEasterEggs(): EasterEggsContent {
  return easterEggs;
}

export function getBlogIndex(): BlogIndexContent {
  return blogIndex;
}

export function getBackground(): BackgroundContent {
  return background;
}
