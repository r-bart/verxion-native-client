import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { progressKeys } from "../keys";

export function useRecords() {
  const uc = useDI((c) => c.getRecords);
  return useQuery({
    queryKey: progressKeys.records(),
    queryFn: () => uc.execute(),
  });
}
