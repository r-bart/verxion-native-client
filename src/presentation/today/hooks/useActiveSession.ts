import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { todayKeys } from "../keys";

export function useActiveSession() {
  const uc = useDI((c) => c.getActiveSession);
  return useQuery({
    queryKey: todayKeys.activeSession(),
    queryFn: () => uc.execute(),
    refetchInterval: 30_000,
  });
}
