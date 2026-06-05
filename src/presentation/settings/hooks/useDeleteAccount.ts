import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";

/**
 * Delete the account (`DELETE /users/me`), then sign out and clear the cache so
 * AuthGuard routes back to login. The sign-out is best-effort — the session may
 * already be invalid after deletion.
 */
export function useDeleteAccount() {
  const del = useDI((c) => c.deleteAccount);
  const signOut = useDI((c) => c.signOut);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await del.execute();
      try {
        await signOut.execute();
      } catch {
        // Session may already be gone; the cache clear below is what matters.
      }
    },
    onSuccess: () => {
      track("settings_account_deleted");
      qc.clear();
    },
    onError: (error) =>
      track("settings_account_delete_failed", {
        error_message: error instanceof Error ? error.message : "unknown",
      }),
  });
}
