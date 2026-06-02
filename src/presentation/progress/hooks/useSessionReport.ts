import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { progressKeys } from "../keys";

export function useSessionReport(sessionId: string) {
  const uc = useDI((c) => c.getSessionReport);
  return useQuery({
    queryKey: progressKeys.sessionReport(sessionId),
    queryFn: () => uc.execute(sessionId),
    enabled: !!sessionId,
  });
}
