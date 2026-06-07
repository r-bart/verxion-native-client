import type { INutritionPort } from "@/domain/nutrition/ports/INutritionPort";
import type { DiaryDayDetail } from "@/domain/nutrition/models/DiaryDayDetail";

/** Reads a closed day's diary report (curated `GET /nutrition/diary-day/{date}`). */
export class GetDiaryDayUseCase {
  constructor(private readonly port: INutritionPort) {}

  async execute(date: string, tzOffsetMinutes?: number): Promise<DiaryDayDetail> {
    return this.port.getDiaryDay(date, tzOffsetMinutes);
  }
}
