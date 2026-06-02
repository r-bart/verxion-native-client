import type { ISessionPort } from "@/domain/sessions/ports/ISessionPort";
import type { Session } from "@/domain/sessions/models/Session";

export class GetActiveSessionUseCase {
  constructor(private readonly port: ISessionPort) {}

  async execute(): Promise<Session | null> {
    return this.port.getActiveSession();
  }
}
