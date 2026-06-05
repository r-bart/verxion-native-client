import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";

/**
 * The "Detalle de día" aggregate for one workout day (metadata + exercise plan).
 * Read via `GetDayDetailViewUseCase`; the repository stubs it until the platform
 * ships `GET /training/days/{id}/detail`.
 */
export function useDayDetailView(dayId: string) {
  const uc = useDI((c) => c.getDayDetailView);
  return useQuery({
    queryKey: trainingKeys.dayDetailView(dayId),
    queryFn: () => uc.execute(dayId),
    staleTime: 5 * 60_000,
  });
}
