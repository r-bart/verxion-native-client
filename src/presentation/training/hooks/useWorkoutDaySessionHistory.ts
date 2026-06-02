import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

export function useWorkoutDaySessionHistory(workoutDayId: string | undefined) {
  const uc = useDI((c) => c.listSessions);
  return useQuery({
    queryKey: trainingKeys.sessionHistory(workoutDayId ?? ""),
    queryFn: () => uc.execute({ workoutDayId, limit: 10 }),
    enabled: !!workoutDayId,
  });
}
