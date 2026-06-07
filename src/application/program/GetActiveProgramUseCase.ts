import type { IProgramPort } from "@/domain/program/ports/IProgramPort";
import type { ProgramOverview } from "@/domain/program/models/Program";

/** The active program (or null) — the detail target when arriving from Hoy. */
export class GetActiveProgramUseCase {
  constructor(private readonly port: IProgramPort) {}

  async execute(): Promise<ProgramOverview | null> {
    return this.port.getActiveProgram();
  }
}
