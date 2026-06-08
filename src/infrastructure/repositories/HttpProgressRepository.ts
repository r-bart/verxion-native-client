import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type {
  ProgressOverview,
  ProgressHistory,
  ProgressMeasureDetail,
  ProgressExerciseDetail,
  ProgressPeriod,
  MeasurePeriod,
  ExerciseMetric,
} from "@/domain/progress/models/Progress";
import { apiClient } from "../api/apiClient";

/**
 * HttpProgressRepository — the Progreso read surface over the curated
 * `/api/v1/progress` read-models (tag `Progress`). One GET per screen, no client
 * fan-out: all derivation (e1RM, deltas, windows, phase bands) is server-side and
 * `apiClient` unwraps the `{ data }` envelope. Read-only. The typed fixtures in
 * `domain/progress/__fixtures__` stay as the test payloads.
 * See `docs/progreso/progress-screen-spec.md`.
 */
export class HttpProgressRepository implements IProgressPort {
  /** GET /api/v1/progress?period= → { data: ProgressOverview }. */
  async getOverview(period?: ProgressPeriod): Promise<ProgressOverview> {
    return apiClient.get<ProgressOverview>("/progress", period ? { period } : undefined);
  }

  /** GET /api/v1/progress/history?today= → { data: ProgressHistory }. */
  async getHistory(today?: string): Promise<ProgressHistory> {
    return apiClient.get<ProgressHistory>("/progress/history", today ? { today } : undefined);
  }

  /** GET /api/v1/progress/measure/{metric}?period= → { data: ProgressMeasureDetail }. */
  async getMeasure(metric: string, period?: MeasurePeriod): Promise<ProgressMeasureDetail> {
    return apiClient.get<ProgressMeasureDetail>(
      `/progress/measure/${encodeURIComponent(metric)}`,
      period ? { period } : undefined,
    );
  }

  /** GET /api/v1/progress/exercise/{slug}?metric= → { data: ProgressExerciseDetail }. */
  async getExerciseDetail(
    slug: string,
    metric?: ExerciseMetric,
  ): Promise<ProgressExerciseDetail> {
    return apiClient.get<ProgressExerciseDetail>(
      `/progress/exercise/${encodeURIComponent(slug)}`,
      metric ? { metric } : undefined,
    );
  }
}
