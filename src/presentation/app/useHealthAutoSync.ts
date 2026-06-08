import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useDI } from "@/infrastructure/di/DIContext";
import { deviceToday, flattenSyncResult } from "@/presentation/_shared/lib/healthSync";

/**
 * Drives HealthKit → platform sync on app start and on each return to the
 * foreground. Runs only when Apple Health is available on this build (the stub
 * reports `available:false`, so this is inert in JS/simulator). Failures are
 * isolated inside the use case and reported via telemetry; one in-flight run at
 * a time. The closed-app HKObserver/background-delivery path is a device-tuned
 * follow-up; this foreground trigger covers the common "open the app" case.
 */
export function useHealthAutoSync() {
  const sync = useDI((c) => c.syncHealthToPlatform);
  const status = useDI((c) => c.getHealthStatus);
  const { track } = useDI((c) => c.telemetry);
  const running = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (running.current) return;
      running.current = true;
      try {
        const s = await status.execute();
        if (!s.available) return;
        const result = await sync.execute(deviceToday());
        track("health_synced", flattenSyncResult(result));
      } catch (error) {
        track("health_sync_failed", {
          error_message: error instanceof Error ? error.message : "unknown",
        });
      } finally {
        running.current = false;
      }
    };

    void run(); // initial reconcile on mount
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void run();
    });
    return () => subscription.remove();
  }, [sync, status, track]);
}
