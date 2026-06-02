import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { MonthDetail } from "@/domain/progress/models/Progress";

export class GetMonthDetailUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(period: string): Promise<MonthDetail> {
    return this.port.getMonthDetail(period);
  }
}
