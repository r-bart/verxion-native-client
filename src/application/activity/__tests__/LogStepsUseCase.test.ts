import { LogStepsUseCase } from "../LogStepsUseCase";
import type { IActivityPort } from "@/domain/activity/ports/IActivityPort";
import type { StepLog } from "@/domain/activity/models/Activity";

describe("LogStepsUseCase", () => {
  const mockStepLog: StepLog = {
    id: "step-1",
    steps: 10000,
    date: "2026-03-27",
  };

  function createMockPort(overrides: Partial<IActivityPort> = {}): IActivityPort {
    return {
      logSteps: jest.fn().mockResolvedValue(mockStepLog),
      logWater: jest.fn(),
      getDailyWater: jest.fn(),
      getDailySteps: jest.fn(),
      listStepLogs: jest.fn(),
      ...overrides,
    };
  }

  it("calls port.logSteps with steps and today's date", async () => {
    const port = createMockPort();
    const uc = new LogStepsUseCase(port);

    const today = new Date().toISOString().slice(0, 10);
    const result = await uc.execute(10000);

    expect(port.logSteps).toHaveBeenCalledWith(10000, today);
    expect(result).toBe(mockStepLog);
  });

  it("passes today's date automatically", async () => {
    const port = createMockPort();
    const uc = new LogStepsUseCase(port);
    await uc.execute(5000);

    const callArgs = (port.logSteps as jest.Mock).mock.calls[0];
    // Second argument should be a YYYY-MM-DD date string
    expect(callArgs[1]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      logSteps: jest.fn().mockRejectedValue(new Error("Server error")),
    });
    const uc = new LogStepsUseCase(port);
    await expect(uc.execute(10000)).rejects.toThrow("Server error");
  });
});
