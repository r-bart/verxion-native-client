import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { WorkoutDayExercise } from "@/domain/training/models/Routine";

export class GetWorkoutDayExercisesUseCase {
  constructor(private readonly port: ITrainingPort) {}

  async execute(routineId: string, dayId: string): Promise<WorkoutDayExercise[]> {
    return this.port.getWorkoutDayExercises(routineId, dayId);
  }
}
