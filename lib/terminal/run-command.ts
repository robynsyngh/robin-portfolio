import type {
  ArchitectureContent,
  EasterEggsContent,
  ExperienceItem,
  Profile,
  Project,
  SkillsContent,
  TerminalCommandResult,
  TerminalContent,
} from "@/lib/types";

export type TerminalContext = {
  terminal: TerminalContent;
  easterEggs: EasterEggsContent;
  profile: Profile;
  projects: Project[];
  skills: SkillsContent;
  experience: ExperienceItem[];
  architecture: ArchitectureContent;
};

function socialHref(profile: Profile, label: string) {
  return profile.social.find((item) => item.label.toLowerCase() === label)?.href;
}

export function runTerminalCommand(
  rawInput: string,
  context: TerminalContext,
): TerminalCommandResult {
  const input = rawInput.trim();
  const normalized = input.toLowerCase();

  if (!normalized) {
    return { lines: [] };
  }

  const { terminal, easterEggs, profile, projects, skills, experience, architecture } =
    context;

  if (normalized === "clear") {
    return { lines: [], clear: true };
  }

  if (normalized === "ask" || normalized === "ask ") {
    return {
      lines: [
        "Usage: ask <question>",
        "e.g. ask what did you build at Credee?",
        "e.g. ask why redis over just mysql?",
      ],
    };
  }

  if (normalized === "help") {
    const standard = terminal.commands.map(
      (command) => `${command.name.padEnd(14)} ${command.description}`,
    );
    const eggs = easterEggs.eggs.map(
      (egg) => `${egg.command.padEnd(18)} ${egg.summary}`,
    );

    return {
      lines: [
        "Available commands",
        "",
        ...standard,
        "",
        "Easter eggs",
        "",
        ...eggs,
        "",
        "Hint: Konami code unlocks developer mode.",
      ],
    };
  }

  if (normalized === "about") {
    return {
      lines: [
        profile.name,
        profile.title,
        "",
        profile.summary,
        "",
        `Focus: ${profile.focusAreas.join(" · ")}`,
        `Company: ${profile.currentCompany}`,
        `Experience: ${profile.experienceYears}`,
      ],
    };
  }

  if (normalized === "whoami") {
    return {
      lines: [
        profile.name,
        profile.title,
        "uid=01(robin) gid=01(engineers) groups=production,fintech,ai",
      ],
    };
  }

  if (normalized === "projects") {
    return {
      lines: [
        "Featured projects",
        "",
        ...projects.map(
          (project) =>
            `- ${project.title} [${project.type}] — ${project.summary}`,
        ),
      ],
    };
  }

  if (normalized === "skills") {
    return {
      lines: [
        "Production skills",
        "",
        ...skills.items.map(
          (skill) =>
            `- ${skill.name} (${skill.years}y) — ${skill.productionUsage}`,
        ),
      ],
    };
  }

  if (normalized === "architecture") {
    return {
      lines: [
        architecture.title,
        "",
        ...architecture.nodes.map((node, index) => {
          const connector = index === architecture.nodes.length - 1 ? "└─" : "├─";
          return `${connector} ${node.label}`;
        }),
        "",
        "Scroll to #architecture for the sticky walkthrough.",
      ],
      open: "/#architecture",
    };
  }

  if (normalized === "blog") {
    return {
      lines: ["Opening /blog ..."],
      open: "/blog",
    };
  }

  if (normalized === "contact") {
    return {
      lines: [
        `email     ${profile.email}`,
        `github    ${socialHref(profile, "github") ?? "n/a"}`,
        `linkedin  ${socialHref(profile, "linkedin") ?? "n/a"}`,
        `resume    ${profile.resumePath}`,
      ],
    };
  }

  if (normalized === "resume") {
    return {
      lines: ["Preparing resume download..."],
      download: profile.resumePath,
    };
  }

  if (normalized === "github") {
    const href = socialHref(profile, "github");
    return href
      ? { lines: [`Opening ${href}`], open: href }
      : { lines: ["GitHub link not configured."] };
  }

  if (normalized === "linkedin") {
    const href = socialHref(profile, "linkedin");
    return href
      ? { lines: [`Opening ${href}`], open: href }
      : { lines: ["LinkedIn link not configured."] };
  }

  if (normalized === "sudo hire robin") {
    return {
      lines: easterEggs.responses.hire,
      download: profile.resumePath,
    };
  }

  if (normalized === "npm install robin") {
    return {
      lines: easterEggs.responses.npmInstall,
      effect: "npm",
    };
  }

  if (normalized === "git log") {
    const commits = experience.flatMap((item) => [
      `commit ${item.id.padEnd(12)} (${item.start} → ${item.end})`,
      `Author: ${profile.name} <${profile.email}>`,
      "",
      `    ${item.role} @ ${item.company}`,
      `    ${item.summary}`,
      ...item.highlights.map((highlight) => `    - ${highlight}`),
      "",
    ]);

    return { lines: commits.length ? commits : ["No commits found."] };
  }

  if (normalized === "redis-cli") {
    return { lines: easterEggs.responses.redisCli };
  }

  if (normalized === "stripe test") {
    return {
      lines: easterEggs.responses.stripeTest,
      effect: "stripe",
    };
  }

  if (normalized === "coffee") {
    return {
      lines: easterEggs.responses.coffee,
      effect: "coffee",
    };
  }

  if (normalized === "developer-mode" || normalized === "devmode") {
    return {
      lines: [easterEggs.konami.unlockMessage],
      enableDeveloperMode: true,
    };
  }

  return {
    lines: [terminal.unknown.replace("{{command}}", input)],
  };
}
