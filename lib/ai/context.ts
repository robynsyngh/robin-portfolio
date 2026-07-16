import {
  getAchievements,
  getCaseStudies,
  getExperience,
  getProfile,
  getProjects,
  getSkills,
} from "@/lib/content";

/**
 * Builds a compact, structured knowledge base from the same content/*.json
 * files that power the rest of the site. This keeps the AI's answers
 * grounded in what is actually published, rather than letting it invent
 * facts about Robin's background.
 */
export function buildPortfolioKnowledgeBase(): string {
  const profile = getProfile();
  const experience = getExperience();
  const projects = getProjects();
  const skills = getSkills();
  const caseStudies = getCaseStudies();
  const achievements = getAchievements();

  const sections: string[] = [];

  sections.push(
    [
      `Name: ${profile.name}`,
      `Title: ${profile.title}`,
      `Summary: ${profile.summary}`,
      `Location: ${profile.location}`,
      `Experience: ${profile.experienceYears}`,
      `Current company: ${profile.currentCompany}`,
      `Focus areas: ${profile.focusAreas.join(", ")}`,
      `Contact email: ${profile.email}`,
    ].join("\n"),
  );

  sections.push(
    "EXPERIENCE:\n" +
      experience
        .map(
          (item) =>
            `- ${item.role} @ ${item.company} (${item.start} - ${item.end}): ${item.summary} Highlights: ${item.highlights.join("; ")}`,
        )
        .join("\n"),
  );

  sections.push(
    "PROJECTS:\n" +
      projects
        .map(
          (project) =>
            `- ${project.title} (${project.type}): ${project.summary} Role: ${project.role}. Stack: ${project.stack.join(", ")}. Key lessons: ${project.lessons.join("; ")}`,
        )
        .join("\n"),
  );

  sections.push(
    "SKILLS:\n" +
      skills.items
        .map(
          (skill) =>
            `- ${skill.name} (${skill.years}y): ${skill.productionUsage} Challenges: ${skill.challenges}`,
        )
        .join("\n"),
  );

  sections.push(
    "CASE STUDIES:\n" +
      caseStudies
        .map(
          (study) =>
            `- ${study.title}: ${study.summary} Problem: ${study.problem} Approach: ${study.approach} Outcomes: ${study.outcomes.join("; ")}`,
        )
        .join("\n"),
  );

  sections.push(
    "ACHIEVEMENTS:\n" +
      achievements.items
        .map((item) => `- ${item.label}: ${item.value} ${item.detail} — ${item.description}`)
        .join("\n"),
  );

  return sections.join("\n\n");
}

export function buildSystemPrompt(): string {
  const knowledgeBase = buildPortfolioKnowledgeBase();

  return `You are the AI mode of an interactive terminal embedded in Robin Singh's portfolio website. You answer questions about Robin's experience, projects, skills, and production systems on his behalf, in third person, using ONLY the knowledge base below.

Rules:
- Only use facts from the knowledge base. Never invent employers, dates, numbers, or technologies that are not present.
- Keep answers short and terminal-appropriate: 2-5 sentences, plain text, no markdown formatting, no headings, no bullet asterisks (use "-" if you must list).
- If asked something unrelated to Robin's work (general trivia, coding help unrelated to him, etc.), briefly decline and redirect to what you can help with.
- If asked something you cannot answer from the knowledge base (e.g. availability, salary, personal contact details beyond what's listed), say so plainly and suggest using the "contact" command or emailing him directly.
- Never break character or mention which AI provider or model powers you. You are "portfolio-shell AI mode".
- Tone: confident, precise, engineer-to-engineer. No fluff, no emojis.

KNOWLEDGE BASE:
${knowledgeBase}`;
}
