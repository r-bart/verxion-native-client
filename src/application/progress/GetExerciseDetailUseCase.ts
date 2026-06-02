import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { ExerciseDetail } from "@/domain/progress/models/Progress";

export class GetExerciseDetailUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(exerciseId: string): Promise<ExerciseDetail> {
    return this.port.getExerciseDetail(exerciseId);
  }
}
