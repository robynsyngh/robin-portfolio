"use client";

import { useEffect, useRef, useState } from "react";

type UseTypingSequenceOptions = {
  enabled?: boolean;
  charMs?: number;
  linePauseMs?: number;
  onComplete?: () => void;
};

export function useTypingSequence(
  lines: string[],
  {
    enabled = true,
    charMs = 18,
    linePauseMs = 220,
    onComplete,
  }: UseTypingSequenceOptions = {},
) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [done, setDone] = useState(!enabled || lines.length === 0);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  onCompleteRef.current = onComplete;

  useEffect(() => {
    completedRef.current = false;

    if (!enabled || lines.length === 0) {
      setLineIndex(0);
      setCharIndex(0);
      setDone(true);
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
      return;
    }

    setLineIndex(0);
    setCharIndex(0);
    setDone(false);
  }, [enabled, lines]);

  useEffect(() => {
    if (!enabled || done || lines.length === 0) {
      return;
    }

    const currentLine = lines[lineIndex] ?? "";

    if (charIndex < currentLine.length) {
      const timer = window.setTimeout(() => {
        setCharIndex((value) => value + 1);
      }, charMs);

      return () => window.clearTimeout(timer);
    }

    if (lineIndex < lines.length - 1) {
      const timer = window.setTimeout(() => {
        setLineIndex((value) => value + 1);
        setCharIndex(0);
      }, linePauseMs);

      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setDone(true);
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
    }, linePauseMs + 280);

    return () => window.clearTimeout(timer);
  }, [charIndex, charMs, done, enabled, lineIndex, linePauseMs, lines]);

  return {
    completedLines: lines.slice(0, lineIndex),
    currentText: (lines[lineIndex] ?? "").slice(0, charIndex),
    lineIndex,
    done,
  };
}
