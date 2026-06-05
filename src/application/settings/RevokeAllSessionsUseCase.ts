import type { ISettingsPort } from "@/domain/settings";
import type { RevokeAllSessionsResult } from "@/domain/settings";

export class RevokeAllSessionsUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(includeCurrent: boolean): Promise<RevokeAllSessionsResult> {
    return this.port.revokeAllSessions(includeCurrent);
  }
}
