import { createContext, useContext, type ReactNode } from "react";
import { container, type Container } from "./container";

const DIContext = createContext<Container | null>(null);

export function DIProvider({ children }: { children: ReactNode }) {
  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI<T>(selector: (container: Container) => T): T {
  const ctx = useContext(DIContext);
  if (!ctx) throw new Error("useDI must be used within a DIProvider");
  return selector(ctx);
}
