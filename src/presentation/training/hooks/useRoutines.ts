import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

export function useRoutines() {
  const uc = useDI((c) => c.getRoutines);
  return useQuery({
    queryKey: trainingKeys.routines(),
    queryFn: () => uc.execute(),
  });
}
