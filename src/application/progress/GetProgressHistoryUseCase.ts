import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import type { ProgressHistory } from "@/domain/progress/models/Progress";

/** Lente Historial (Cinta / Carrete) — the 30-week series + phase bands + PR marks. */
export class GetProgressHistoryUseCase {
  constructor(private readonly port: IProgressPort) {}

  /** `today` (YYYY-MM-DD) pins the calendar anchor; omit → server uses the real today. */
  async execute(today?: string): Promise<ProgressHistory> {
    return this.port.getHistory(today);
  }
}
