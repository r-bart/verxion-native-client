import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { ExerciseStats } from "@/domain/progress/models/Progress";

export class GetExerciseStatsUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(): Promise<ExerciseStats> {
    return this.port.getExerciseStats();
  }
}
