import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { RoutineDashboard } from "@/domain/training/models/RoutineDashboard";

/** Reads the Entreno landing "Rutina" aggregate (active routine + spine + next). */
export class GetRoutineDashboardUseCase {
  constructor(private readonly port: ITrainingPort) {}

  async execute(): Promise<RoutineDashboard> {
    return this.port.getRoutineDashboard();
  }
}
