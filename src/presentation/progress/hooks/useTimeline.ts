import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { progressKeys } from "../keys";

export function useTimeline(months: number) {
  const uc = useDI((c) => c.getTimeline);
  return useQuery({
    queryKey: progressKeys.timeline(months),
    queryFn: () => uc.execute(months),
  });
}
