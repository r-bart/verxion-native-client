import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useDI } from "@/infrastructure/di/DIContext";
import { useSession } from "@/presentation/auth/hooks/useSession";
import { deviceToday, flattenSyncResult } from "@/presentation/_shared/lib/healthSync";

/**
 * Drives HealthKit → platform sync on app start and on each return to the
 * foreground. Gated on an authenticated session (the push targets the user's
 * API — syncing while logged out would just 401 and re-read the full delta every
 * foreground) AND on Apple Health being available on this build (the stub reports
 * `available:false`, so this is inert in JS/simulator). Failures are isolated
 * inside the use case and reported via telemetry; one in-flight run at a time,
 * and throttled so rapid background/foreground cycles don't re-walk the 7-day
 * steps window every time (the manual "Sync now" button bypasses the throttle).
 * The closed-app HKObserver/background-delivery path is a device-tuned follow-up;
 * this foreground trigger covers the common "open the app" case.
 */
const MIN_SYNC_INTERVAL_MS = 60_000;

export function useHealthAutoSync() {
  const sync = useDI((c) => c.syncHealthToPlatform);
  const status = useDI((c) => c.getHealthStatus);
  const { track } = useDI((c) => c.telemetry);
  const { data: session, isError: sessionError } = useSession();
  const hasSession = !!session && !sessionError;
  const running = useRef(false);
  const lastSyncAt = useRef(0);

  useEffect(() => {
    if (!hasSession) return; // never sync without an authenticated session
    const run = async () => {
      if (running.current) return;
      if (Date.now() - lastSyncAt.current < MIN_SYNC_INTERVAL_MS) return;
      running.current = true;
      try {
        const s = await status.execute();
        if (!s.available) return;
        lastSyncAt.current = Date.now(); // throttle from the attempt, even if it fails
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

    void run(); // initial reconcile once authenticated
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void run();
    });
    return () => subscription.remove();
  }, [hasSession, sync, status, track]);
}
