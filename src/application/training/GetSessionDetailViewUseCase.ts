import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { SessionDetailView } from "@/domain/training/models/SessionDetailView";

/** Reads the "Detalle de sesión" aggregate (the persisted report of a session). */
export class GetSessionDetailViewUseCase {
  constructor(private readonly port: ITrainingPort) {}

  async execute(id: string): Promise<SessionDetailView> {
    return this.port.getSessionDetailView(id);
  }
}
