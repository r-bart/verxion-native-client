import type { ISettingsPort , PrivacyExportJob } from "@/domain/settings";

export class GetLatestExportUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(): Promise<PrivacyExportJob | null> {
    return this.port.getLatestExport();
  }
}
