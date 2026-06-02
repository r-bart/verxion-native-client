import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { ExerciseConfigurationData } from "@/domain/training/models/ExerciseConfiguration";

export class GetExerciseConfigurationUseCase {
  constructor(private readonly port: ITrainingPort) {}

  async execute(wdeId: string): Promise<ExerciseConfigurationData> {
    return this.port.getExerciseConfiguration(wdeId);
  }
}
