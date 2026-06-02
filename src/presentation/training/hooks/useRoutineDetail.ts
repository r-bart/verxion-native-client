import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

export function useRoutineDetail(id: string) {
  const uc = useDI((c) => c.getRoutineDetail);
  return useQuery({
    queryKey: trainingKeys.routineDetail(id),
    queryFn: () => uc.execute(id),
    enabled: !!id,
  });
}
