import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

/** The routine catalogue — backs the Sesiones feed's rutina filter options. */
export function useRoutines() {
  const uc = useDI((c) => c.getRoutines);
  return useQuery({
    queryKey: trainingKeys.routines(),
    queryFn: () => uc.execute(),
    staleTime: 5 * 60_000,
  });
}
