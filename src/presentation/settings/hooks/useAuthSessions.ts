import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { settingsKeys } from "../keys";

/** Active sessions & OAuth tokens (`GET /auth-sessions`). */
export function useAuthSessions() {
  const uc = useDI((c) => c.listAuthSessions);
  return useQuery({
    queryKey: settingsKeys.sessions(),
    queryFn: () => uc.execute(),
    staleTime: 30_000,
  });
}
