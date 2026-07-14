"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/types";
import { getHomeSectionIds, useActiveSection } from "@/hooks/use-active-section";

type ActiveSectionContextValue = {
  activeId: string;
  setActiveIdLocked: (id: string, lockMs?: number) => void;
};

const ActiveSectionContext = createContext<ActiveSectionContextValue | null>(null);

type ActiveSectionProviderProps = {
  navigation: NavItem[];
  children: React.ReactNode;
};

export function ActiveSectionProvider({
  navigation,
  children,
}: ActiveSectionProviderProps) {
  const pathname = usePathname();
  const sectionIds = useMemo(() => getHomeSectionIds(navigation), [navigation]);
  const { activeId, setActiveIdLocked } = useActiveSection(
    sectionIds,
    pathname === "/",
  );

  const value = useMemo(
    () => ({ activeId, setActiveIdLocked }),
    [activeId, setActiveIdLocked],
  );

  return (
    <ActiveSectionContext.Provider value={value}>
      {children}
    </ActiveSectionContext.Provider>
  );
}

export function useActiveSectionContext() {
  const context = useContext(ActiveSectionContext);
  if (!context) {
    throw new Error(
      "useActiveSectionContext must be used within an ActiveSectionProvider",
    );
  }
  return context;
}
