import type { IProgramPort } from "@/domain/program/ports/IProgramPort";
import type { ProgramOverview } from "@/domain/program/models/Program";

/** A single program's overview (detail hero + coupling). */
export class GetProgramUseCase {
  constructor(private readonly port: IProgramPort) {}

  async execute(id: string): Promise<ProgramOverview> {
    return this.port.getProgram(id);
  }
}
