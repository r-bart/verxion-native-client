import type { ISettingsPort } from "@/domain/settings";
import type { AthleteProfile } from "@/domain/settings";

export class GetAthleteProfileUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(): Promise<AthleteProfile | null> {
    return this.port.getProfile();
  }
}
