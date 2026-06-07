import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { nutritionKeys } from "../keys";

/**
 * The "Dietas" library (every diet the agent has built + filter facets). Reads
 * via `GetDietLibraryUseCase` against the curated `GET /nutrition/diet-library`
 * read-model. Search / filter / sort run client-side over this one read.
 */
export function useDietLibrary() {
  const uc = useDI((c) => c.getDietLibrary);
  return useQuery({
    queryKey: nutritionKeys.dietLibrary(),
    queryFn: () => uc.execute(),
    staleTime: 60_000,
  });
}
