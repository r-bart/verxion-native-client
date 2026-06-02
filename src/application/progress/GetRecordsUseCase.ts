import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { PersonalRecord } from "@/domain/progress/models/Progress";

export class GetRecordsUseCase {
  constructor(private readonly port: IProgressPort) {}

  async execute(): Promise<PersonalRecord[]> {
    return this.port.getRecords();
  }
}
