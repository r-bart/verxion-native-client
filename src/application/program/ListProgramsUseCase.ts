import type { IProgramPort } from "@/domain/program/ports/IProgramPort";
import type { ProgramOverview } from "@/domain/program/models/Program";

/** Reads the "Programas" library (every program the agent has built). */
export class ListProgramsUseCase {
  constructor(private readonly port: IProgramPort) {}

  async execute(): Promise<ProgramOverview[]> {
    return this.port.listPrograms();
  }
}
