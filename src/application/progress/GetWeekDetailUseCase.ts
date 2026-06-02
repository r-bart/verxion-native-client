import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { WeekDetail } from "@/domain/progress/models/Progress";

export class GetWeekDetailUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(weekDate: string): Promise<WeekDetail> {
    return this.port.getWeekDetail(weekDate);
  }
}
