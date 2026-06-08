import type { ISettingsPort , AthleteProfile } from "@/domain/settings";

export class GetAthleteProfileUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(): Promise<AthleteProfile | null> {
    return this.port.getProfile();
  }
}
