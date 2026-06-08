import type { ISettingsPort , RevokeAllSessionsResult } from "@/domain/settings";

export class RevokeAllSessionsUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(includeCurrent: boolean): Promise<RevokeAllSessionsResult> {
    return this.port.revokeAllSessions(includeCurrent);
  }
}
