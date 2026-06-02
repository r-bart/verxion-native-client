import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { ProgressionPlan } from "@/domain/training/models/ProgressionPlan";

export class GetProgressionPlanUseCase {
  constructor(private readonly port: ITrainingPort) {}

  async execute(workoutDayId: string): Promise<ProgressionPlan | null> {
    return this.port.getProgressionPlan(workoutDayId);
  }
}
