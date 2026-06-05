import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { settingsKeys } from "../keys";

/** Apps authorized via OAuth (`GET /auth-sessions/apps`). */
export function useConnectedApps() {
  const uc = useDI((c) => c.listConnectedApps);
  return useQuery({
    queryKey: settingsKeys.connectedApps(),
    queryFn: () => uc.execute(),
    staleTime: 30_000,
  });
}
