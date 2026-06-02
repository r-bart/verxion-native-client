import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { Routine } from "@/domain/training/models/Routine";

export class GetRoutinesUseCase {
  constructor(private readonly port: ITrainingPort) {}

  async execute(): Promise<Routine[]> {
    return this.port.getRoutines();
  }
}
