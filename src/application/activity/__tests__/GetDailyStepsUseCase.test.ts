import { GetDailyStepsUseCase } from "../GetDailyStepsUseCase";
import type { IActivityPort } from "@/domain/activity/ports/IActivityPort";

describe("GetDailyStepsUseCase", () => {
  function createMockPort(overrides: Partial<IActivityPort> = {}): IActivityPort {
    return {
      logSteps: jest.fn(),
      logWater: jest.fn(),
      getDailyWater: jest.fn(),
      getDailySteps: jest.fn().mockResolvedValue(8500),
      listStepLogs: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.getDailySteps with date", async () => {
    const port = createMockPort();
    const uc = new GetDailyStepsUseCase(port);
    const result = await uc.execute("2026-03-27");

    expect(port.getDailySteps).toHaveBeenCalledWith("2026-03-27");
    expect(result).toBe(8500);
  });

  it("returns the port result", async () => {
    const port = createMockPort({
      getDailySteps: jest.fn().mockResolvedValue(0),
    });
    const uc = new GetDailyStepsUseCase(port);
    const result = await uc.execute("2026-03-27");
    expect(result).toBe(0);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getDailySteps: jest.fn().mockRejectedValue(new Error("API error")),
    });
    const uc = new GetDailyStepsUseCase(port);
    await expect(uc.execute("2026-03-27")).rejects.toThrow("API error");
  });
});
