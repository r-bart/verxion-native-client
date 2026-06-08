import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import type { HealthMetric } from "@/domain/health";
import { todayKeys } from "@/presentation/today/keys";
import { progressKeys } from "@/presentation/progress/keys";
import { deviceToday, flattenSyncResult } from "@/presentation/_shared/lib/healthSync";
import { settingsKeys } from "../keys";

/** Apple Health integration status (stub adapter until the native binding). */
export function useHealthStatus() {
  const uc = useDI((c) => c.getHealthStatus);
  return useQuery({
    queryKey: settingsKeys.health(),
    queryFn: () => uc.execute(),
    staleTime: 30_000,
  });
}

/** Prompt the HealthKit authorization sheet. */
export function useRequestHealthAuthorization() {
  const uc = useDI((c) => c.requestHealthAuthorization);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => uc.execute(),
    onSuccess: (status) => qc.setQueryData(settingsKeys.health(), status),
  });
}

/** Enable/disable syncing a single metric. */
export function useSetHealthMetric() {
  const uc = useDI((c) => c.setHealthMetric);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ metric, enabled }: { metric: HealthMetric; enabled: boolean }) =>
      uc.execute(metric, enabled),
    onSuccess: (status) => qc.setQueryData(settingsKeys.health(), status),
  });
}

/**
 * Run a HealthKit → platform sync now (manual). Reads device changes and pushes
 * them; on success, refreshes the read-models the sync may have changed and logs
 * the structured SyncResult to telemetry. A no-op on JS builds (stub returns
 * nothing); real work happens on a HealthKit-capable device.
 */
export function useSyncHealth() {
  const uc = useDI((c) => c.syncHealthToPlatform);
  const { track } = useDI((c) => c.telemetry);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => uc.execute(deviceToday()),
    onSuccess: (result) => {
      track("health_synced", flattenSyncResult(result));
      // Refresh the surfaces that show synced weight/cardio/steps.
      qc.invalidateQueries({ queryKey: todayKeys.all });
      qc.invalidateQueries({ queryKey: progressKeys.all });
    },
    onError: (error) =>
      track("health_sync_failed", {
        error_message: error instanceof Error ? error.message : "unknown",
      }),
  });
}
