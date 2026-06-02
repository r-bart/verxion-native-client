import type { ISessionPort } from "@/domain/sessions/ports/ISessionPort";
import type { SessionListItem, SessionListParams } from "@/domain/sessions/models/Session";

export class ListSessionsUseCase {
  constructor(private readonly port: ISessionPort) {}

  async execute(params?: SessionListParams): Promise<SessionListItem[]> {
    return this.port.listSessions(params);
  }
}
