import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { ProgressMeasureDetail, MeasurePeriod } from "@/domain/progress/models/Progress";

/** "Detalle de medida" — one of the 6 body/activity metrics. Omit period → server default. */
export class GetProgressMeasureUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(metric: string, period?: MeasurePeriod): Promise<ProgressMeasureDetail> {
    return this.port.getMeasure(metric, period);
  }
}
