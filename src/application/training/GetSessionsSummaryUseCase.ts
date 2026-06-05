import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { SessionsSummary } from "@/domain/training/models/SessionsSummary";

/** Reads the Entreno landing "Sesiones" recap (3 stats + recent sessions). */
export class GetSessionsSummaryUseCase {
  constructor(private readonly port: ITrainingPort) {}

  async execute(): Promise<SessionsSummary> {
    return this.port.getSessionsSummary();
  }
}
