import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { RoutineLibrary } from "@/domain/training/models/RoutineLibrary";

/** Reads the "Todas las rutinas" library (every routine the agent built + filter facets). */
export class GetRoutineLibraryUseCase {
  constructor(private readonly port: ITrainingPort) {}

  async execute(): Promise<RoutineLibrary> {
    return this.port.getRoutineLibrary();
  }
}
