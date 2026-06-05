import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import type { AthleteProfile, AvatarFile } from "@/domain/settings";
import { userKeys } from "@/presentation/_shared/keys";
import { settingsKeys } from "../keys";

/** Upload a new avatar (`POST /profiles/me/avatar`, multipart). */
export function useUploadAvatar() {
  const uc = useDI((c) => c.uploadAvatar);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: AvatarFile) => uc.execute(file),
    onSuccess: (profile: AthleteProfile) => {
      track("settings_avatar_updated");
      // Instant feedback, then reconcile in case the avatar response carries a
      // leaner profile than GET /profiles/me (avoids clobbering privacy fields).
      qc.setQueryData(settingsKeys.profile(), profile);
      qc.invalidateQueries({ queryKey: settingsKeys.profile() });
      qc.invalidateQueries({ queryKey: userKeys.currentUser() });
    },
    onError: (error) =>
      track("settings_avatar_update_failed", {
        error_message: error instanceof Error ? error.message : "unknown",
      }),
  });
}

/** Remove the current avatar (`DELETE /profiles/me/avatar`). */
export function useRemoveAvatar() {
  const uc = useDI((c) => c.removeAvatar);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => uc.execute(),
    onSuccess: (profile: AthleteProfile) => {
      track("settings_avatar_removed");
      qc.setQueryData(settingsKeys.profile(), profile);
      qc.invalidateQueries({ queryKey: settingsKeys.profile() });
      qc.invalidateQueries({ queryKey: userKeys.currentUser() });
    },
  });
}
