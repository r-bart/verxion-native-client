import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { MonthArchive } from "@/domain/progress/models/Progress";

export class GetMonthsUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(): Promise<MonthArchive[]> {
    return this.port.getMonths();
  }
}
