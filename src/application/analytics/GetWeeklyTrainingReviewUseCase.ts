import type { IAnalyticsPort } from "@/domain/analytics/ports/IAnalyticsPort";
import type { WeeklyTrainingReview } from "@/domain/analytics/models/WeeklyTrainingReview";

export class GetWeeklyTrainingReviewUseCase {
  constructor(private readonly port: IAnalyticsPort) {}

  async execute(weekOf?: string): Promise<WeeklyTrainingReview> {
    return this.port.getWeeklyTrainingReview(weekOf);
  }
}
