import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { settingsKeys } from "../keys";

/** Revoke an app's access (`DELETE /auth-sessions/apps/:clientId`). */
export function useRevokeConnectedApp() {
  const uc = useDI((c) => c.revokeConnectedApp);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => uc.execute(clientId),
    onSuccess: () => {
      track("settings_connected_app_revoked");
      qc.invalidateQueries({ queryKey: settingsKeys.connectedApps() });
      qc.invalidateQueries({ queryKey: settingsKeys.sessions() });
    },
  });
}
