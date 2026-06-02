import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { sessionViewerKeys } from "../keys";

export function useLiveProgress(sessionId: string | undefined) {
  const uc = useDI((c) => c.getLiveProgress);
  return useQuery({
    queryKey: sessionViewerKeys.liveProgress(sessionId ?? ""),
    queryFn: () => uc.execute(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 10_000,
    staleTime: 9_000,
  });
}
