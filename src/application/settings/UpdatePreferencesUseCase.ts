import type { ISettingsPort , UpdatePreferencesInput } from "@/domain/settings";

export class UpdatePreferencesUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(input: UpdatePreferencesInput): Promise<void> {
    return this.port.updatePreferences(input);
  }
}
