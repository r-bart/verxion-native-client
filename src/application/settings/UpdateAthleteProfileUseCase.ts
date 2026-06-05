import type { ISettingsPort } from "@/domain/settings";
import type { AthleteProfile, UpdateProfileInput } from "@/domain/settings";

export class UpdateAthleteProfileUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(input: UpdateProfileInput): Promise<AthleteProfile> {
    return this.port.updateProfile(input);
  }
}
