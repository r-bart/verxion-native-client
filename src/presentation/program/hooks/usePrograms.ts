import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { programKeys } from "../keys";

/** The "Programas" library — every program the agent has built (one read). */
export function usePrograms() {
  const uc = useDI((c) => c.listPrograms);
  return useQuery({
    queryKey: programKeys.list(),
    queryFn: () => uc.execute(),
    staleTime: 60_000,
  });
}
