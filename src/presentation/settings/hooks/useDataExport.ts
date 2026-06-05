import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { settingsKeys } from "../keys";

/** Latest data-export job (`GET /users/me/export/latest`), null if none. */
export function useLatestExport() {
  const uc = useDI((c) => c.getLatestExport);
  return useQuery({
    queryKey: settingsKeys.export(),
    queryFn: () => uc.execute(),
    staleTime: 15_000,
  });
}

/** Request a new data export (`POST /users/me/export`). */
export function useRequestExport() {
  const uc = useDI((c) => c.requestDataExport);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => uc.execute(),
    onSuccess: (job) => {
      track("settings_data_export_requested");
      qc.setQueryData(settingsKeys.export(), job);
    },
    onError: (error) =>
      track("settings_data_export_failed", {
        error_message: error instanceof Error ? error.message : "unknown",
      }),
  });
}
