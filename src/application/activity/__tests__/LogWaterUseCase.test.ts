import { LogWaterUseCase } from "../LogWaterUseCase";
import type { IActivityPort } from "@/domain/activity/ports/IActivityPort";

describe("LogWaterUseCase", () => {
  function createMockPort(overrides: Partial<IActivityPort> = {}): IActivityPort {
    return {
      logSteps: jest.fn(),
      logWater: jest.fn().mockResolvedValue(undefined),
      getDailyWater: jest.fn(),
      getDailySteps: jest.fn(),
      listStepLogs: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.logWater with amountMl", async () => {
    const port = createMockPort();
    const uc = new LogWaterUseCase(port);
    await uc.execute(500);

    expect(port.logWater).toHaveBeenCalledWith(500);
  });

  it("returns void", async () => {
    const port = createMockPort();
    const uc = new LogWaterUseCase(port);
    const result = await uc.execute(250);
    expect(result).toBeUndefined();
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      logWater: jest.fn().mockRejectedValue(new Error("Validation error")),
    });
    const uc = new LogWaterUseCase(port);
    await expect(uc.execute(0)).rejects.toThrow("Validation error");
  });
});
