export type SocialLink = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export type Profile = {
  name: string;
  title: string;
  headline: string;
  headlineLines: string[];
  summary: string;
  location: string;
  experienceYears: string;
  currentCompany: string;
  siteUrl: string;
  email: string;
  resumePath: string;
  focusAreas: string[];
  social: SocialLink[];
};

export type LoaderContent = {
  sessionKey: string;
  steps: string[];
};

export type HeroNode = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type HeroContent = {
  exploreLabel: string;
  exploreHref: string;
  resumeLabel: string;
  nodes: HeroNode[];
  links: [string, string][];
};

export type ScrollStage = {
  id: string;
  label: string;
  detail: string;
};

export type ScrollProgressContent = {
  label: string;
  stages: ScrollStage[];
};

export type ArchitectureNode = {
  id: string;
  label: string;
  purpose: string;
  usage: string;
  challenges: string;
  story: string;
};

export type ArchitectureContent = {
  eyebrow: string;
  title: string;
  description: string;
  nodes: ArchitectureNode[];
};

export type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  summary: string;
  highlights: string[];
};

export type JourneyMilestone = {
  id: string;
  date: string;
  title: string;
  detail: string;
};

export type JourneyContent = {
  eyebrow: string;
  title: string;
  description: string;
  milestones: JourneyMilestone[];
};

export type Skill = {
  id: string;
  name: string;
  years: number;
  overview: string;
  projects: string[];
  productionUsage: string;
  challenges: string;
  favoriteUse: string;
};

export type SkillsContent = {
  eyebrow: string;
  title: string;
  description: string;
  items: Skill[];
};

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  type: "production" | "personal";
  summary: string;
  role: string;
  stack: string[];
  features: string[];
  architecture: string[];
  lessons: string[];
  github?: string;
  liveUrl?: string;
  caseStudySlugs?: string[];
};

export type CaseStudy = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  projectIds: string[];
  problem: string;
  approach: string;
  architecture: string[];
  lessons: string[];
  outcomes: string[];
};

export type AchievementItem = {
  id: string;
  label: string;
  value: string;
  detail: string;
  description: string;
};

export type AchievementsContent = {
  eyebrow: string;
  title: string;
  description: string;
  items: AchievementItem[];
};

export type ContactContent = {
  eyebrow: string;
  title: string;
  description: string;
  availability: string;
  ctaLabel: string;
  note: string;
};

export type TerminalCommandMeta = {
  name: string;
  description: string;
};

export type TerminalContent = {
  eyebrow: string;
  title: string;
  description: string;
  prompt: string;
  welcome: string[];
  unknown: string;
  commands: TerminalCommandMeta[];
};

export type EasterEggMeta = {
  id: string;
  command: string;
  summary: string;
};

export type DeveloperMetric = {
  id: string;
  label: string;
};

export type EasterEggsContent = {
  eggs: EasterEggMeta[];
  responses: {
    hire: string[];
    npmInstall: string[];
    redisCli: string[];
    stripeTest: string[];
    coffee: string[];
  };
  konami: {
    sequence: string[];
    unlockMessage: string;
  };
  developerMode: {
    title: string;
    metrics: DeveloperMetric[];
  };
  duck: {
    unlockTitle: string;
    unlockMessage: string;
    ariaLabel: string;
  };
};

export type TerminalCommandResult = {
  lines: string[];
  clear?: boolean;
  download?: string;
  open?: string;
  enableDeveloperMode?: boolean;
  effect?: "stripe" | "coffee" | "npm";
};

export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  category: string;
  published: boolean;
};

export type BlogPost = BlogFrontmatter & {
  slug: string;
  readingTime: string;
  content: string;
};

export type BlogIndexContent = {
  title: string;
  headline: string;
  description: string;
  categories: string[];
};

export type BackgroundNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  tier: number;
};

export type BackgroundEdge = {
  id: string;
  from: string;
  to: string;
};

export type BackgroundContent = {
  gridCell: number;
  influenceRadius: number;
  magnetStrength: number;
  parallaxStrength: number;
  velocityInfluence: number;
  maxVelocityOffset: number;
  signalCount: number;
  baseSignalSpeed: number;
  restOpacity: number;
  focusBoost: number;
  contentSafeLeft: number;
  nodes: BackgroundNode[];
  edges: BackgroundEdge[];
};
