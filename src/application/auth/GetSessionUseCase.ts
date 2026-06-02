import type { SessionData } from "@/domain/auth/models/AuthUser";
import type { IAuthPort } from "@/domain/auth/ports/IAuthPort";

export class GetSessionUseCase {
  constructor(private readonly port: IAuthPort) {}
  async execute(): Promise<SessionData | null> {
    return this.port.getSession();
  }
}
