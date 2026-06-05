import type { ITodayPort } from "@/domain/today/ports/ITodayPort";
import type { TodayDashboard } from "@/domain/today/models/TodayDashboard";

export class GetTodayDashboardUseCase {
  constructor(private readonly port: ITodayPort) {}

  async execute(date?: string): Promise<TodayDashboard> {
    return this.port.getDashboard(date);
  }
}
