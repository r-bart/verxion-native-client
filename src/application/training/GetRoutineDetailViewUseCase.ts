import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { RoutineDetailView } from "@/domain/training/models/RoutineDetailView";

/** Reads the "Detalle de rutina" aggregate (metadata + day rotation) for one routine. */
export class GetRoutineDetailViewUseCase {
  constructor(private readonly port: ITrainingPort) {}

  async execute(id: string): Promise<RoutineDetailView> {
    return this.port.getRoutineDetailView(id);
  }
}
