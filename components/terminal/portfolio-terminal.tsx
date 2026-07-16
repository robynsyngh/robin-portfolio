"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useEasterEggs } from "@/components/easter-eggs/easter-egg-context";
import { Container, Text } from "@/components/ui";
import { runTerminalCommand, type TerminalContext } from "@/lib/terminal/run-command";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type HistoryItem = {
  id: string;
  type: "input" | "output";
  text: string;
};

type PortfolioTerminalProps = {
  context: TerminalContext;
};

function triggerDownload(path: string) {
  const link = document.createElement("a");
  link.href = path;
  link.download = path.split("/").pop() || "resume.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function PortfolioTerminal({ context }: PortfolioTerminalProps) {
  const terminal = context.terminal;
  const reducedMotion = usePrefersReducedMotion();
  const { enableDeveloperMode } = useEasterEggs();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>(() =>
    terminal.welcome.map((line, index) => ({
      id: `welcome-${index}`,
      type: "output",
      text: line,
    })),
  );
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [effect, setEffect] = useState<"stripe" | "coffee" | "npm" | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const askHistoryRef = useRef<{ role: "user" | "assistant"; text: string }[]>([]);

  const eggHints = useMemo(
    () => context.easterEggs.eggs.slice(0, 3).map((egg) => egg.command),
    [context.easterEggs.eggs],
  );

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [history, effect, reducedMotion]);

  const pushOutput = (lines: string[]) => {
    if (!lines.length) {
      return;
    }

    setHistory((current) => [
      ...current,
      ...lines.map((line, index) => ({
        id: `${Date.now()}-${index}-${line}`,
        type: "output" as const,
        text: line,
      })),
    ]);
  };

  const appendOutput = (id: string, text: string) => {
    setHistory((current) => [...current, { id, type: "output", text }]);
  };

  const updateOutput = (id: string, text: string) => {
    setHistory((current) =>
      current.map((item) => (item.id === id ? { ...item, text } : item)),
    );
  };

  const askAI = async (question: string) => {
    if (isAsking) {
      appendOutput(
        `${Date.now()}-busy`,
        "Still thinking about the last question — hang tight.",
      );
      return;
    }

    setIsAsking(true);
    const outputId = `${Date.now()}-ai`;
    appendOutput(outputId, "…");

    let accumulated = "";

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          history: askHistoryRef.current,
        }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        accumulated += chunk;
        updateOutput(outputId, accumulated);
      }

      if (!accumulated.trim()) {
        accumulated = "No response. Try rephrasing, or use `about` / `projects`.";
        updateOutput(outputId, accumulated);
      }

      askHistoryRef.current = [
        ...askHistoryRef.current,
        { role: "user" as const, text: question },
        { role: "assistant" as const, text: accumulated },
      ].slice(-8);
    } catch {
      updateOutput(
        outputId,
        "AI mode hit a network error. Try again, or use `about` / `projects` / `contact`.",
      );
    } finally {
      setIsAsking(false);
    }
  };

  const run = (raw: string) => {
    const input = raw.trim();
    if (!input) {
      return;
    }

    setHistory((current) => [
      ...current,
      {
        id: `${Date.now()}-input`,
        type: "input",
        text: input,
      },
    ]);
    setCommandHistory((current) => [input, ...current].slice(0, 50));
    setHistoryIndex(-1);
    setValue("");

    const askMatch = /^ask\s+(.+)$/i.exec(input);
    if (askMatch) {
      void askAI(askMatch[1].trim());
      return;
    }

    const result = runTerminalCommand(input, context);

    if (result.clear) {
      setHistory([]);
      setEffect(null);
      return;
    }

    pushOutput(result.lines);

    if (result.download) {
      triggerDownload(result.download);
    }

    if (result.open) {
      if (result.open.startsWith("http")) {
        window.open(result.open, "_blank", "noopener,noreferrer");
      } else {
        window.location.href = result.open;
      }
    }

    if (result.enableDeveloperMode) {
      enableDeveloperMode();
    }

    if (result.effect) {
      setEffect(result.effect);
      window.setTimeout(() => setEffect(null), reducedMotion ? 900 : 2200);
    }
  };

  return (
    <section id="terminal" className="scroll-mt-24 py-[var(--space-section)]">
      <Container>
        <header className="mb-12 max-w-3xl md:mb-16">
          <Text as="p" variant="label">
            {terminal.eyebrow}
          </Text>
          <Text as="h2" variant="heading" className="mt-4">
            {terminal.title}
          </Text>
          <Text as="p" variant="muted" className="mt-4 max-w-2xl">
            {terminal.description}
          </Text>
          <p className="mt-4 font-mono text-xs tracking-wide text-muted">
            Try: {eggHints.join(" · ")}
          </p>
        </header>

        <div
          role="region"
          aria-label="Interactive portfolio terminal"
          className="border border-border bg-surface"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-mono text-xs tracking-wide text-muted">
              portfolio-shell
            </p>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
              interactive
            </p>
          </div>

          <div
            ref={scrollerRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            className="h-[min(24rem,65vh)] overflow-y-auto px-4 py-4 font-mono text-sm leading-relaxed md:h-[min(28rem,70vh)]"
            data-lenis-prevent
          >
            <div className="space-y-1">
              {history.map((item) => (
                <p
                  key={item.id}
                  className={cn(
                    "whitespace-pre-wrap break-words",
                    item.type === "input" ? "text-foreground" : "text-muted",
                  )}
                >
                  {item.type === "input" ? (
                    <>
                      <span className="mr-2 text-foreground/60">{terminal.prompt}</span>
                      {item.text}
                    </>
                  ) : (
                    item.text || " "
                  )}
                </p>
              ))}
            </div>

            <AnimatePresence>
              {effect ? (
                <motion.div
                  key={effect}
                  initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.3 }}
                  className="mt-4 border border-border bg-background px-3 py-3 text-xs text-foreground"
                >
                  {effect === "stripe" ? (
                    <div className="space-y-2">
                      <p>payment_intent → processing</p>
                      <div className="h-px w-full bg-border">
                        <motion.div
                          className="h-px bg-signal"
                          initial={reducedMotion ? false : { width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{
                            duration: reducedMotion ? 0 : 1.2,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </div>
                      <p className="text-muted">charge.succeeded</p>
                    </div>
                  ) : null}
                  {effect === "coffee" ? <p>developer.energy += 100</p> : null}
                  {effect === "npm" ? <p>package robin@latest installed into PATH</p> : null}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <form
              className="mt-3 flex min-h-11 items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                run(value);
              }}
            >
              <label htmlFor="portfolio-terminal-input" className="sr-only">
                Terminal command
              </label>
              <span className="shrink-0 text-foreground/60" aria-hidden>
                {terminal.prompt}
              </span>
              <input
                id="portfolio-terminal-input"
                ref={inputRef}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    const nextIndex = Math.min(
                      historyIndex + 1,
                      commandHistory.length - 1,
                    );
                    if (commandHistory[nextIndex]) {
                      setHistoryIndex(nextIndex);
                      setValue(commandHistory[nextIndex]);
                    }
                  }

                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    if (historyIndex <= 0) {
                      setHistoryIndex(-1);
                      setValue("");
                      return;
                    }

                    const nextIndex = historyIndex - 1;
                    setHistoryIndex(nextIndex);
                    setValue(commandHistory[nextIndex] ?? "");
                  }
                }}
                className="w-full bg-transparent text-foreground placeholder:text-muted/60 focus-visible:outline-none"
                placeholder="help"
                autoComplete="off"
                spellCheck={false}
                aria-describedby="terminal-hint"
              />
            </form>
            <p id="terminal-hint" className="sr-only">
              Press Enter to run a command. Use Up and Down arrows for history.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
