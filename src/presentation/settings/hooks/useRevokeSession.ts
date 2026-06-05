import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { settingsKeys } from "../keys";

/** Revoke a single session/token (`DELETE /auth-sessions/:id`). */
export function useRevokeSession() {
  const uc = useDI((c) => c.revokeSession);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => uc.execute(id),
    onSuccess: () => {
      track("settings_session_revoked");
      qc.invalidateQueries({ queryKey: settingsKeys.sessions() });
    },
  });
}
