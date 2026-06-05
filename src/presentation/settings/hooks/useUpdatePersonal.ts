import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import type { UpdateAccountInput, UpdatePreferencesInput } from "@/domain/settings";
import { settingsKeys } from "../keys";

export interface UpdatePersonalInput {
  account?: UpdateAccountInput;
  preferences?: UpdatePreferencesInput;
}

function hasKeys(o?: object): boolean {
  return !!o && Object.keys(o).length > 0;
}

/**
 * Save the Personal & Fitness form. Personal identity fields go to
 * `PUT /users/me`; the primary goal lives in preferences (`PUT
 * /users/me/preferences`). Only the groups that actually changed are sent.
 */
export function useUpdatePersonal() {
  const updateAccount = useDI((c) => c.updateAccount);
  const updatePreferences = useDI((c) => c.updatePreferences);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdatePersonalInput) => {
      if (hasKeys(input.account)) {
        await updateAccount.execute(input.account!);
      }
      if (
        hasKeys(input.preferences?.fitnessPreferences) ||
        hasKeys(input.preferences?.appPreferences)
      ) {
        await updatePreferences.execute(input.preferences!);
      }
    },
    onSuccess: () => {
      track("settings_personal_updated");
      qc.invalidateQueries({ queryKey: settingsKeys.account() });
    },
    onError: (error) =>
      track("settings_personal_update_failed", {
        error_message: error instanceof Error ? error.message : "unknown",
      }),
  });
}
