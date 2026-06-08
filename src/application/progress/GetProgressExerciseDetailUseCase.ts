import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { ProgressExerciseDetail, ExerciseMetric } from "@/domain/progress/models/Progress";

/** "Detalle de ejercicio" (tab Progreso). Omit metric → server default (e1rm). */
export class GetProgressExerciseDetailUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(slug: string, metric?: ExerciseMetric): Promise<ProgressExerciseDetail> {
    return this.port.getExerciseDetail(slug, metric);
  }
}
