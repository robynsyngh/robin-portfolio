"use client";

import { createContext, useContext } from "react";
import type Lenis from "lenis";

const LenisContext = createContext<Lenis | null>(null);

export function LenisProvider({
  lenis,
  children,
}: {
  lenis: Lenis | null;
  children: React.ReactNode;
}) {
  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export function useLenis() {
  return useContext(LenisContext);
}
