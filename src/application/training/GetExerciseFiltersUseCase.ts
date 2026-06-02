import type { IExerciseCatalogPort } from "@/domain/training/ports/IExerciseCatalogPort";
import type { ExerciseFiltersData } from "@/domain/training/models/Exercise";

export class GetExerciseFiltersUseCase {
  constructor(private readonly port: IExerciseCatalogPort) {}

  async execute(): Promise<ExerciseFiltersData> {
    return this.port.getExerciseFilters();
  }
}
