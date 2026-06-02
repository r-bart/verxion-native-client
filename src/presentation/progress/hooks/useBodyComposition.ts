import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { progressKeys } from "../keys";

export function useBodyComposition(period: string) {
  const uc = useDI((c) => c.getBodyComposition);
  return useQuery({
    queryKey: progressKeys.bodyComp(period),
    queryFn: () => uc.execute(period),
  });
}
