import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import type { UpdateProfileInput } from "@/domain/settings";
import { userKeys } from "@/presentation/_shared/keys";
import { settingsKeys } from "../keys";

/** Update display name / bio / sport tags (`PUT /profiles/me`). */
export function useUpdateAthleteProfile() {
  const uc = useDI((c) => c.updateAthleteProfile);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => uc.execute(input),
    onSuccess: () => {
      track("settings_profile_updated");
      qc.invalidateQueries({ queryKey: settingsKeys.profile() });
      qc.invalidateQueries({ queryKey: userKeys.currentUser() });
    },
    onError: (error) =>
      track("settings_profile_update_failed", {
        error_message: error instanceof Error ? error.message : "unknown",
      }),
  });
}
