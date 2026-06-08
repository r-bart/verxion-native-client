import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { ProgressOverview, ProgressPeriod } from "@/domain/progress/models/Progress";

/** "Progreso" madre (Resumen + Métricas). Omitting period uses the server default. */
export class GetProgressOverviewUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(period?: ProgressPeriod): Promise<ProgressOverview> {
    return this.port.getOverview(period);
  }
}
