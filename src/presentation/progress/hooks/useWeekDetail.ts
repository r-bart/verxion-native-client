import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { progressKeys } from "../keys";

export function useWeekDetail(weekDate: string) {
  const uc = useDI((c) => c.getWeekDetail);
  return useQuery({
    queryKey: progressKeys.weekDetail(weekDate),
    queryFn: () => uc.execute(weekDate),
    enabled: !!weekDate,
  });
}
