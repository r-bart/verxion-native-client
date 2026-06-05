import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { settingsKeys } from "../keys";

/**
 * Bulk session revocation (`POST /auth-sessions/revoke-all`). With
 * `includeCurrent`, the current session dies too — the caller should clear the
 * cache and let AuthGuard route back to login.
 */
export function useRevokeAllSessions() {
  const uc = useDI((c) => c.revokeAllSessions);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (includeCurrent: boolean) => uc.execute(includeCurrent),
    onSuccess: (_result, includeCurrent) => {
      track("settings_sessions_revoked_all", { include_current: includeCurrent });
      if (includeCurrent) {
        qc.clear();
      } else {
        qc.invalidateQueries({ queryKey: settingsKeys.sessions() });
      }
    },
  });
}
