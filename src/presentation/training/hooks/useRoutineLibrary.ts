import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

/**
 * The "Todas las rutinas" library (every routine the agent built + filter facets).
 * Read via `GetRoutineLibraryUseCase`; the repository stubs it until the platform
 * ships `GET /training/routine-library`. Search / filter / sort run client-side
 * over this one read (see `useRoutineLibraryView`).
 */
export function useRoutineLibrary() {
  const uc = useDI((c) => c.getRoutineLibrary);
  return useQuery({
    queryKey: trainingKeys.routineLibrary(),
    queryFn: () => uc.execute(),
    staleTime: 5 * 60_000,
  });
}
