import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { progressKeys } from "../keys";

export function useMonthDetail(period: string) {
  const uc = useDI((c) => c.getMonthDetail);
  return useQuery({
    queryKey: progressKeys.monthDetail(period),
    queryFn: () => uc.execute(period),
    enabled: !!period,
  });
}
