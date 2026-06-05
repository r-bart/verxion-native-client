import type { ITrainingPort } from "@/domain/training/ports/ITrainingPort";
import type { SessionFeedPage, SessionFeedParams } from "@/domain/training/models/SessionFeed";

/** Reads one page of the Entreno landing "Sesiones" feed (blocks + cursor). */
export class GetSessionFeedUseCase {
  constructor(private readonly port: ITrainingPort) {}

  async execute(params: SessionFeedParams): Promise<SessionFeedPage> {
    return this.port.getSessionFeed(params);
  }
}
