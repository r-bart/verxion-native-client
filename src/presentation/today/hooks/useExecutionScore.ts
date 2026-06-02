import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "../keys";

export function useExecutionScore() {
  const uc = useDI((c) => c.getExecutionScore);
  return useQuery({
    queryKey: todayKeys.executionScore(1),
    queryFn: () => uc.execute(1),
  });
}
