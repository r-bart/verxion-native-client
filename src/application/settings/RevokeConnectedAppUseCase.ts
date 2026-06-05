import type { ISettingsPort } from "@/domain/settings";

export class RevokeConnectedAppUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(clientId: string): Promise<void> {
    return this.port.revokeConnectedApp(clientId);
  }
}
