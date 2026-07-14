"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge, Button, Text, TextLink } from "@/components/ui";
import type { CaseStudy, Project } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProjectItemProps = {
  project: Project;
  caseStudies: CaseStudy[];
  index: number;
};

export function ProjectItem({ project, caseStudies, index }: ProjectItemProps) {
  const [open, setOpen] = useState(project.type === "production");

  return (
    <article className="border-t border-border py-10 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Text as="p" variant="mono">
              {String(index + 1).padStart(2, "0")}
            </Text>
            <Badge className="bg-transparent">
              {project.type === "production" ? "Production" : "Personal"}
            </Badge>
          </div>
          <Text as="h3" variant="title" className="mt-4">
            {project.title}
          </Text>
          <Text as="p" variant="mono" className="mt-3 text-foreground/80">
            {project.subtitle}
          </Text>
          <Text as="p" variant="muted" className="mt-5 max-w-md">
            {project.summary}
          </Text>
          <Text as="p" variant="mono" className="mt-5 max-w-md">
            {project.role}
          </Text>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
            >
              {open ? "Hide details" : "View details"}
            </Button>
            {project.github ? (
              <Button
                href={project.github}
                variant="ghost"
                size="sm"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </Button>
            ) : null}
          </div>
        </div>

        <div>
          <div>
            <Text as="p" variant="label">
              Features
            </Text>
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.features.map((feature) => (
                <li key={feature}>
                  <Badge>{feature}</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <Text as="p" variant="label">
              Stack
            </Text>
            <p className="mt-4 font-mono text-sm tracking-wide text-muted">
              {project.stack.join(" · ")}
            </p>
          </div>

          {caseStudies.length > 0 ? (
            <div className="mt-8">
              <Text as="p" variant="label">
                Case studies
              </Text>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {caseStudies.map((study) => (
                  <li key={study.slug}>
                    <TextLink
                      href={`/case-studies/${study.slug}`}
                      className="font-mono text-sm tracking-wide no-underline text-muted hover:text-foreground"
                    >
                      {study.title}
                    </TextLink>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "mt-10 grid gap-8 border-t border-border pt-10",
                "md:grid-cols-2",
              )}
            >
              <div>
                <Text as="p" variant="label">
                  Architecture
                </Text>
                <ul className="mt-4 space-y-3">
                  {project.architecture.map((item) => (
                    <li key={item} className="flex gap-3 text-muted">
                      <span className="mt-2 h-px w-4 shrink-0 bg-border" />
                      <Text as="p" variant="muted" className="text-base">
                        {item}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Text as="p" variant="label">
                  Lessons
                </Text>
                <ul className="mt-4 space-y-3">
                  {project.lessons.map((item) => (
                    <li key={item} className="flex gap-3 text-muted">
                      <span className="mt-2 h-px w-4 shrink-0 bg-border" />
                      <Text as="p" variant="muted" className="text-base">
                        {item}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
