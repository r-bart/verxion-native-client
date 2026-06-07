import type { ProgramOverview } from "../models/Program";
import type { ProgramAdherence } from "../models/ProgramAdherence";

/**
 * IProgramPort — the program read surface. All read-only: creating / activating /
 * pausing a program is the agent via MCP (the UI frames those as a request to the
 * agent, never a write). Maps to the `/api/v1/programs*` routes; the aggregate
 * `ProgramOverview` is composed server-side (see `docs/program-screen-spec.md`).
 */
export interface IProgramPort {
  /** "Programas" library — every program the agent has built (any status). */
  listPrograms(): Promise<ProgramOverview[]>;
  /** The active program, or null when none is active. Feeds the Hoy slot. */
  getActiveProgram(): Promise<ProgramOverview | null>;
  /** "Detalle de programa" — a single program's overview. */
  getProgram(id: string): Promise<ProgramOverview>;
  /** Unified adherence (ring + sub-bars) for a program. */
  getProgramAdherence(id: string): Promise<ProgramAdherence>;
}
