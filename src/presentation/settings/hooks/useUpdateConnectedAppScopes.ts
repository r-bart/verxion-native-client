import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import type { UpdateConnectedAppScopesInput } from "@/domain/settings";
import { settingsKeys } from "../keys";

/**
 * Update an app's granular consent (`PATCH /auth-sessions/apps/:clientId/scopes`).
 * Changing scopes revokes the app's active tokens server-side, so we refresh
 * both lists.
 */
export function useUpdateConnectedAppScopes() {
  const uc = useDI((c) => c.updateConnectedAppScopes);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateConnectedAppScopesInput) => uc.execute(input),
    onSuccess: () => {
      track("settings_connected_app_scopes_updated");
      qc.invalidateQueries({ queryKey: settingsKeys.connectedApps() });
      qc.invalidateQueries({ queryKey: settingsKeys.sessions() });
    },
  });
}
