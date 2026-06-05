import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { ExerciseLibrary } from "@/domain/training/models/ExerciseLibrary";

/** Reads the Entreno landing "Ejercicios" library (catalogue + filter facets). */
export class GetExerciseLibraryUseCase {
  constructor(private readonly port: ITrainingPort) {}

  async execute(): Promise<ExerciseLibrary> {
    return this.port.getExerciseLibrary();
  }
}
