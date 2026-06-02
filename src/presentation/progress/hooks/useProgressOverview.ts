import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { progressKeys } from "../keys";

export function useProgressOverview() {
  const uc = useDI((c) => c.getProgressOverview);
  return useQuery({
    queryKey: progressKeys.overview(),
    queryFn: () => uc.execute(),
  });
}
