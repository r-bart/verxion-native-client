import { LogWeightUseCase } from "../LogWeightUseCase";
import type { IMeasurementsPort } from "@/domain/measurements/ports/IMeasurementsPort";
import type { WeightLog } from "@/domain/measurements/models/Measurement";

describe("LogWeightUseCase", () => {
  const mockWeightLog: WeightLog = {
    id: "wl-1",
    weight: 79.5,
    unit: "kg",
    date: "2026-03-27",
  };

  function createMockPort(
    overrides: Partial<IMeasurementsPort> = {}
  ): IMeasurementsPort {
    return {
      logWeight: jest.fn().mockResolvedValue(mockWeightLog),
      ...overrides,
    };
  }

  it("calls port.logWeight with weightKg and current ISO timestamp", async () => {
    const port = createMockPort();
    const uc = new LogWeightUseCase(port);

    const beforeCall = new Date().toISOString();
    const result = await uc.execute(79.5);
    const afterCall = new Date().toISOString();

    expect(port.logWeight).toHaveBeenCalledTimes(1);
    const callArgs = (port.logWeight as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toBe(79.5);
    // Second argument should be an ISO timestamp between before and after
    expect(callArgs[1]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(callArgs[1] >= beforeCall).toBe(true);
    expect(callArgs[1] <= afterCall).toBe(true);
    expect(result).toBe(mockWeightLog);
  });

  it("returns the port result", async () => {
    const port = createMockPort();
    const uc = new LogWeightUseCase(port);
    const result = await uc.execute(80);
    expect(result).toEqual(mockWeightLog);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      logWeight: jest.fn().mockRejectedValue(new Error("Invalid weight")),
    });
    const uc = new LogWeightUseCase(port);
    await expect(uc.execute(-1)).rejects.toThrow("Invalid weight");
  });
});
