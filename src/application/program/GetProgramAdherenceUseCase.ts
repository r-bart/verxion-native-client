import type { IProgramPort } from "@/domain/program/ports/IProgramPort";
import type { ProgramAdherence } from "@/domain/program/models/ProgramAdherence";

/** Unified adherence (ring + sub-bars) for a program's detail screen. */
export class GetProgramAdherenceUseCase {
  constructor(private readonly port: IProgramPort) {}

  async execute(id: string): Promise<ProgramAdherence> {
    return this.port.getProgramAdherence(id);
  }
}
