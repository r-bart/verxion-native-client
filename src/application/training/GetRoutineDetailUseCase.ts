import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { RoutineDetail } from "@/domain/training/models/Routine";

export class GetRoutineDetailUseCase {
  constructor(private readonly port: ITrainingPort) {}

  async execute(id: string): Promise<RoutineDetail> {
    return this.port.getRoutineDetail(id);
  }
}
