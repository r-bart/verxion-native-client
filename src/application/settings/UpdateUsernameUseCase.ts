import type { ISettingsPort , AthleteProfile } from "@/domain/settings";

export class UpdateUsernameUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(username: string): Promise<AthleteProfile> {
    return this.port.updateUsername(username);
  }
}
