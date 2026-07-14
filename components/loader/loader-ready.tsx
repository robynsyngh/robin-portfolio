"use client";

import { createContext, useContext } from "react";

const LoaderReadyContext = createContext(false);

export function LoaderReadyProvider({
  ready,
  children,
}: {
  ready: boolean;
  children: React.ReactNode;
}) {
  return (
    <LoaderReadyContext.Provider value={ready}>{children}</LoaderReadyContext.Provider>
  );
}

export function useLoaderReady() {
  return useContext(LoaderReadyContext);
}
