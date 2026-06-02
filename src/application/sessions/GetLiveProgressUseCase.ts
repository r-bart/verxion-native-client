import type { ISessionPort } from "@/domain/sessions/ports/ISessionPort";
import type { LiveSessionProgress } from "@/domain/sessions/models/Session";

export class GetLiveProgressUseCase {
  constructor(private readonly port: ISessionPort) {}

  async execute(sessionId: string): Promise<LiveSessionProgress> {
    return this.port.getLiveProgress(sessionId);
  }
}
