import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { SessionReport } from "@/domain/progress/models/Progress";

export class GetSessionReportUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(sessionId: string): Promise<SessionReport> {
    return this.port.getSessionReport(sessionId);
  }
}
