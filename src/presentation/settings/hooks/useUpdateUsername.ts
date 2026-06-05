import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { userKeys } from "@/presentation/_shared/keys";
import { settingsKeys } from "../keys";

/** Change the username (`PUT /profiles/me/username`, 30-day cooldown). */
export function useUpdateUsername() {
  const uc = useDI((c) => c.updateUsername);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => uc.execute(username),
    onSuccess: () => {
      track("settings_username_updated");
      qc.invalidateQueries({ queryKey: settingsKeys.profile() });
      qc.invalidateQueries({ queryKey: settingsKeys.account() });
      // The header avatar/initials read the onboarding currentUser.
      qc.invalidateQueries({ queryKey: userKeys.currentUser() });
    },
    onError: (error) =>
      track("settings_username_update_failed", {
        error_message: error instanceof Error ? error.message : "unknown",
      }),
  });
}
