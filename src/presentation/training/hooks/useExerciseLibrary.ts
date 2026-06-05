import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

/**
 * The Entreno landing "Ejercicios" library (catalogue + filter facets). Read via
 * `GetExerciseLibraryUseCase`; the repository stubs it until the platform ships
 * `GET /training/exercise-library`. Search / filter / sort run client-side over
 * this one read (see `useExerciseLibraryView`).
 */
export function useExerciseLibrary() {
  const uc = useDI((c) => c.getExerciseLibrary);
  return useQuery({
    queryKey: trainingKeys.exerciseLibrary(),
    queryFn: () => uc.execute(),
    staleTime: 5 * 60_000,
  });
}
