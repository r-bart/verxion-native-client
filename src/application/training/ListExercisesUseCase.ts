import type { IExerciseCatalogPort } from "@/domain/training/ports/IExerciseCatalogPort";
import type { ExerciseSearchParams, ExerciseSearchResult } from "@/domain/training/models/Exercise";

export class ListExercisesUseCase {
  constructor(private readonly port: IExerciseCatalogPort) {}

  async execute(params: ExerciseSearchParams): Promise<ExerciseSearchResult[]> {
    return this.port.searchExercises(params);
  }
}
