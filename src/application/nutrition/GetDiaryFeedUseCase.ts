import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DiaryFeedPage } from "@/domain/nutrition/models/DiaryFeed";

/** Reads the diary feed — logged days by phase (curated `GET /nutrition/diary-feed`). */
export class GetDiaryFeedUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(tzOffsetMinutes?: number): Promise<DiaryFeedPage> {
    return this.port.getDiaryFeed(tzOffsetMinutes);
  }
}
