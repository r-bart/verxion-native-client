import type { ISettingsPort } from "@/domain/settings";
import type { AthleteProfile } from "@/domain/settings";

export class RemoveAvatarUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(): Promise<AthleteProfile> {
    return this.port.removeAvatar();
  }
}
