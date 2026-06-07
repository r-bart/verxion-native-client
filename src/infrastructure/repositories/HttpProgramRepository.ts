import type { IProgramPort } from "@/domain/program/ports/IProgramPort";
import type { ProgramOverview } from "@/domain/program/models/Program";
import type { ProgramAdherence } from "@/domain/program/models/ProgramAdherence";
import { apiClient } from "../api/apiClient";

/**
 * HttpProgramRepository — the program read surface over the platform read-models.
 *
 * Live: the composed `ProgramOverview` read-model is wired into the GET routes
 * (`GetProgramOverviewUseCase` / `ProgramOverviewBuilder`); `apiClient` unwraps
 * the `{ data }` envelope. Read-only — writes (activate/pause/duplicate) are the
 * agent via MCP, never called here. The typed fixtures in
 * `domain/program/__fixtures__` remain as the test payloads.
 */
export class HttpProgramRepository implements IProgramPort {
  /** GET /api/v1/programs → { data: ProgramOverview[] }. */
  async listPrograms(): Promise<ProgramOverview[]> {
    return apiClient.get<ProgramOverview[]>("/programs");
  }

  /** GET /api/v1/programs/active → { data: ProgramOverview | null }. */
  async getActiveProgram(): Promise<ProgramOverview | null> {
    return apiClient.get<ProgramOverview | null>("/programs/active");
  }

  /** GET /api/v1/programs/{id} → { data: ProgramOverview }. */
  async getProgram(id: string): Promise<ProgramOverview> {
    return apiClient.get<ProgramOverview>(`/programs/${id}`);
  }

  /** GET /api/v1/programs/{id}/adherence → { data: ProgramAdherence }. */
  async getProgramAdherence(id: string): Promise<ProgramAdherence> {
    return apiClient.get<ProgramAdherence>(`/programs/${id}/adherence`);
  }
}
