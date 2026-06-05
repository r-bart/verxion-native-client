import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { DayDetailView } from "@/domain/training/models/DayDetailView";

/** Reads the "Detalle de día" aggregate (day metadata + ordered exercise plan). */
export class GetDayDetailViewUseCase {
  constructor(private readonly port: ITrainingPort) {}

  async execute(dayId: string): Promise<DayDetailView> {
    return this.port.getDayDetailView(dayId);
  }
}
