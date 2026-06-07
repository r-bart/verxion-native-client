import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { programKeys } from "../keys";

/** The active program (or null) — the detail target when arriving from Hoy. */
export function useActiveProgram(enabled = true) {
  const uc = useDI((c) => c.getActiveProgram);
  return useQuery({
    queryKey: programKeys.active(),
    queryFn: () => uc.execute(),
    enabled,
    staleTime: 60_000,
  });
}
