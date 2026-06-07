import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { nutritionKeys } from "../keys";

/**
 * A single diet's detail (header + day meal spine + agent note). Reads via
 * `GetDietDetailUseCase` against the curated `GET /nutrition/diet-detail/{planId}`.
 */
export function useDietDetail(id: string) {
  const uc = useDI((c) => c.getDietDetail);
  return useQuery({
    queryKey: nutritionKeys.dietDetail(id),
    queryFn: () => uc.execute(id),
    enabled: id !== "",
    staleTime: 60_000,
  });
}
