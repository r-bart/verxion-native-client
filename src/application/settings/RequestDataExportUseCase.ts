import type { ISettingsPort , PrivacyExportJob } from "@/domain/settings";

export class RequestDataExportUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(): Promise<PrivacyExportJob> {
    return this.port.requestDataExport();
  }
}
