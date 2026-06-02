import type { IAnalyticsPort } from "@/domain/analytics/ports/IAnalyticsPort";
import type { SuggestedNextWorkout } from "@/domain/analytics/models/Analytics";

export class GetSuggestedNextWorkoutUseCase {
  constructor(private readonly port: IAnalyticsPort) {}

  async execute(): Promise<SuggestedNextWorkout> {
    return this.port.getSuggestedNextWorkout();
  }
}
