import type { ISettingsPort } from "@/domain/settings";
import type { AthleteProfile } from "@/domain/settings";

export class UpdateUsernameUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(username: string): Promise<AthleteProfile> {
    return this.port.updateUsername(username);
  }
}
