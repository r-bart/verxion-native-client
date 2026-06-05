import type { ISettingsPort, SectionVisibility } from "@/domain/settings";

export class UpdateVisibilityUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(visibility: SectionVisibility): Promise<void> {
    return this.port.updateVisibility(visibility);
  }
}
