import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { nutritionKeys } from "../keys";

export function useDietPlanDetail(id: string) {
  const uc = useDI((c) => c.getDietPlanDetail);
  return useQuery({
    queryKey: nutritionKeys.dietPlanDetail(id),
    queryFn: () => uc.execute(id),
    enabled: !!id,
  });
}
