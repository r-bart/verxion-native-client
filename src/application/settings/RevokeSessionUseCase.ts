import type { ISettingsPort } from "@/domain/settings";

export class RevokeSessionUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(id: string): Promise<void> {
    return this.port.revokeSession(id);
  }
}
