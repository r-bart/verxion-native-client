import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { WeekArchive } from "@/domain/progress/models/Progress";

export class GetWeeksUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(): Promise<WeekArchive[]> {
    return this.port.getWeeks();
  }
}
