import type { ISettingsPort , AthleteProfile, AvatarFile } from "@/domain/settings";

export class UploadAvatarUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(file: AvatarFile): Promise<AthleteProfile> {
    return this.port.uploadAvatar(file);
  }
}
