import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "../keys";

export function useSuggestedNextWorkout() {
  const uc = useDI((c) => c.getSuggestedNextWorkout);
  return useQuery({
    queryKey: todayKeys.suggestedNextWorkout(),
    queryFn: () => uc.execute(),
  });
}
