"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { EasterEggsContent } from "@/lib/types";

type Toast = {
  id: string;
  title: string;
  message: string;
};

type EasterEggContextValue = {
  easterEggs: EasterEggsContent;
  developerMode: boolean;
  duckFound: boolean;
  toast: Toast | null;
  enableDeveloperMode: () => void;
  findDuck: () => void;
  dismissToast: () => void;
};

const EasterEggContext = createContext<EasterEggContextValue | null>(null);

const DEVELOPER_KEY = "robin-portfolio-developer-mode";
const DUCK_KEY = "robin-portfolio-duck-found";

export function EasterEggProvider({
  easterEggs,
  children,
}: {
  easterEggs: EasterEggsContent;
  children: React.ReactNode;
}) {
  const [developerMode, setDeveloperMode] = useState(false);
  const [duckFound, setDuckFound] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    setDeveloperMode(localStorage.getItem(DEVELOPER_KEY) === "1");
    setDuckFound(localStorage.getItem(DUCK_KEY) === "1");
  }, []);

  const enableDeveloperMode = useCallback(() => {
    setDeveloperMode(true);
    localStorage.setItem(DEVELOPER_KEY, "1");
    setToast({
      id: "developer-mode",
      title: easterEggs.developerMode.title,
      message: easterEggs.konami.unlockMessage,
    });
  }, [easterEggs.developerMode.title, easterEggs.konami.unlockMessage]);

  const findDuck = useCallback(() => {
    if (localStorage.getItem(DUCK_KEY) === "1") {
      return;
    }

    setDuckFound(true);
    localStorage.setItem(DUCK_KEY, "1");
    setToast({
      id: "duck",
      title: easterEggs.duck.unlockTitle,
      message: easterEggs.duck.unlockMessage,
    });
  }, [easterEggs.duck.unlockMessage, easterEggs.duck.unlockTitle]);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const sequence = easterEggs.konami.sequence;
    let index = 0;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const expected = sequence[index];
      const expectedKey =
        expected.length === 1 ? expected.toLowerCase() : expected;

      if (key === expectedKey) {
        index += 1;
        if (index >= sequence.length) {
          index = 0;
          enableDeveloperMode();
        }
        return;
      }

      index = key === sequence[0] ? 1 : 0;
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [easterEggs.konami.sequence, enableDeveloperMode]);

  const value = useMemo(
    () => ({
      easterEggs,
      developerMode,
      duckFound,
      toast,
      enableDeveloperMode,
      findDuck,
      dismissToast,
    }),
    [
      easterEggs,
      developerMode,
      duckFound,
      toast,
      enableDeveloperMode,
      findDuck,
      dismissToast,
    ],
  );

  return (
    <EasterEggContext.Provider value={value}>{children}</EasterEggContext.Provider>
  );
}

export function useEasterEggs() {
  const context = useContext(EasterEggContext);
  if (!context) {
    throw new Error("useEasterEggs must be used within EasterEggProvider");
  }
  return context;
}
