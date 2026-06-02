import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { ProgressOverview } from "@/domain/progress/models/Progress";

export class GetProgressOverviewUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(): Promise<ProgressOverview> {
    return this.port.getOverview();
  }
}
