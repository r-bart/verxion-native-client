import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { progressKeys } from "../keys";

/** Lente Historial (Cinta / Carrete) — the 30-week series + phase bands + PR marks. */
export function useProgressHistory() {
  const uc = useDI((c) => c.getProgressHistory);
  return useQuery({
    queryKey: progressKeys.history(),
    queryFn: () => uc.execute(),
    staleTime: 60_000,
  });
}
