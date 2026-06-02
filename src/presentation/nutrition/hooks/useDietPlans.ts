import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { nutritionKeys } from "../keys";

export function useDietPlans() {
  const uc = useDI((c) => c.getDietPlans);
  return useQuery({
    queryKey: nutritionKeys.dietPlans(),
    queryFn: () => uc.execute(),
  });
}
