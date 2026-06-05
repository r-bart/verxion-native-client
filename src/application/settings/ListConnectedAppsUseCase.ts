import type { ISettingsPort } from "@/domain/settings";
import type { ConnectedApp } from "@/domain/settings";

export class ListConnectedAppsUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(): Promise<ConnectedApp[]> {
    return this.port.listConnectedApps();
  }
}
