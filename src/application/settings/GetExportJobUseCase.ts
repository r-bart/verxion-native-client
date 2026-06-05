import type { ISettingsPort } from "@/domain/settings";
import type { PrivacyExportJob } from "@/domain/settings";

export class GetExportJobUseCase {
  constructor(private readonly port: ISettingsPort) {}

  async execute(id: string): Promise<PrivacyExportJob> {
    return this.port.getExportJob(id);
  }
}
