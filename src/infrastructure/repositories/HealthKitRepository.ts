import type { IHealthPort, HealthMetric, HealthStatus } from "@/domain/health";

/**
 * Stub Apple Health adapter. The native HealthKit binding (react-native-healthkit
 * + config plugin + entitlements + a custom dev client) is a follow-up; until
 * then `available` is `false` so the settings screen renders an "unavailable in
 * this build" state instead of pretending to sync. Swap this class for the real
 * native implementation behind `IHealthPort` without touching presentation.
 */
const UNAVAILABLE: HealthStatus = {
  available: false,
  connected: false,
  metrics: { weight: false, steps: false, cardio: false },
};

export class HealthKitRepository implements IHealthPort {
  async getStatus(): Promise<HealthStatus> {
    return UNAVAILABLE;
  }

  async requestAuthorization(): Promise<HealthStatus> {
    return UNAVAILABLE;
  }

  async setMetricEnabled(
    _metric: HealthMetric,
    _enabled: boolean,
  ): Promise<HealthStatus> {
    return UNAVAILABLE;
  }
}
