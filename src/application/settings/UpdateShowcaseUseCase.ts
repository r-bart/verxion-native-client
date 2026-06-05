import type { ISettingsPort, ShowcaseMetric } from "@/domain/settings";

export class UpdateShowcaseUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(metrics: ShowcaseMetric[]): Promise<void> {
    return this.port.updateShowcase(metrics);
  }
}
