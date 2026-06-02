import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { BodyComposition } from "@/domain/progress/models/Progress";

export class GetBodyCompositionUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(period: string): Promise<BodyComposition> {
    return this.port.getBodyComposition(period);
  }
}
