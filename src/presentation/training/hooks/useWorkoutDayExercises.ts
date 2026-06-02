import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

export function useWorkoutDayExercises(routineId: string, dayId: string) {
  const uc = useDI((c) => c.getWorkoutDayExercises);
  return useQuery({
    queryKey: trainingKeys.workoutDayExercises(routineId, dayId),
    queryFn: () => uc.execute(routineId, dayId),
    enabled: !!routineId && !!dayId,
  });
}
