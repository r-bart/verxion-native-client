import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { programKeys } from "../keys";

/** Unified adherence (ring + sub-bars) for a program's detail screen. */
export function useProgramAdherence(id: string) {
  const uc = useDI((c) => c.getProgramAdherence);
  return useQuery({
    queryKey: programKeys.adherence(id),
    queryFn: () => uc.execute(id),
    enabled: id !== "",
    staleTime: 60_000,
  });
}
