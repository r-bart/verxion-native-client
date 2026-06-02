import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { progressKeys } from "../keys";

export function useMonths() {
  const uc = useDI((c) => c.getMonths);
  return useQuery({
    queryKey: progressKeys.months(),
    queryFn: () => uc.execute(),
  });
}
