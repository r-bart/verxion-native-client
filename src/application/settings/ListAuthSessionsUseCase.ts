import type { ISettingsPort , AuthSessionsResult } from "@/domain/settings";

export class ListAuthSessionsUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(): Promise<AuthSessionsResult> {
    return this.port.listAuthSessions();
  }
}
