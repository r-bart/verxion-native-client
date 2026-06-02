import { GetDailyWaterUseCase } from "../GetDailyWaterUseCase";
import type { IActivityPort } from "@/domain/activity/ports/IActivityPort";
import type { DailyWater } from "@/domain/activity/models/Activity";

describe("GetDailyWaterUseCase", () => {
  const mockWater: DailyWater = {
    totalMl: 2000,
    date: "2026-03-27",
    logs: [{ id: "w-1", amountMl: 500, loggedAt: "2026-03-27T08:00:00Z" }],
  };

  function createMockPort(overrides: Partial<IActivityPort> = {}): IActivityPort {
    return {
      logSteps: jest.fn(),
      logWater: jest.fn(),
      getDailyWater: jest.fn().mockResolvedValue(mockWater),
      getDailySteps: jest.fn(),
      listStepLogs: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.getDailyWater with date", async () => {
    const port = createMockPort();
    const uc = new GetDailyWaterUseCase(port);
    const result = await uc.execute("2026-03-27");

    expect(port.getDailyWater).toHaveBeenCalledWith("2026-03-27");
    expect(result).toBe(mockWater);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new GetDailyWaterUseCase(port);
    const result = await uc.execute("2026-03-27");
    expect(result.totalMl).toBe(2000);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getDailyWater: jest.fn().mockRejectedValue(new Error("Not found")),
    });
    const uc = new GetDailyWaterUseCase(port);
    await expect(uc.execute("2026-03-27")).rejects.toThrow("Not found");
  });
});
