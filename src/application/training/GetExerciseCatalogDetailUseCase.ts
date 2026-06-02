import type { IExerciseCatalogPort } from "@/domain/training/ports/IExerciseCatalogPort";
import type { ExerciseDetail } from "@/domain/training/models/Exercise";

export class GetExerciseCatalogDetailUseCase {
  constructor(private readonly port: IExerciseCatalogPort) {}

  async execute(id: string): Promise<ExerciseDetail> {
    return this.port.getExerciseDetail(id);
  }
}
