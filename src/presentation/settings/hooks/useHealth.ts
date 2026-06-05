import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import type { HealthMetric } from "@/domain/health";
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
