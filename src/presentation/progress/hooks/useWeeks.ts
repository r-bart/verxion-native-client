import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { progressKeys } from "../keys";

export function useWeeks() {
  const uc = useDI((c) => c.getWeeks);
  return useQuery({
    queryKey: progressKeys.weeks(),
    queryFn: () => uc.execute(),
  });
}
