import { GetProgressOverviewUseCase } from "../GetProgressOverviewUseCase";
import { GetProgressHistoryUseCase } from "../GetProgressHistoryUseCase";
import { GetProgressMeasureUseCase } from "../GetProgressMeasureUseCase";
import { GetProgressExerciseDetailUseCase } from "../GetProgressExerciseDetailUseCase";
import type { IProgressPort } from "@/domain/progress/ports/IProgressPort";
import {
  progressOverviewFixture,
  progressHistoryFixture,
  progressMeasureDetailFixture,
  progressExerciseDetailFixture,
} from "@/domain/progress/__fixtures__/progressFixtures";

function createMockPort(overrides: Partial<IProgressPort> = {}): IProgressPort {
  return {
    getOverview: jest.fn().mockResolvedValue(progressOverviewFixture),
    getHistory: jest.fn().mockResolvedValue(progressHistoryFixture),
    getMeasure: jest.fn().mockResolvedValue(progressMeasureDetailFixture),
    getExerciseDetail: jest.fn().mockResolvedValue(progressExerciseDetailFixture),
    ...overrides,
  };
}

describe("Progress use cases", () => {
  it("GetProgressOverviewUseCase forwards the optional period", async () => {
    const port = createMockPort();
    const uc = new GetProgressOverviewUseCase(port);
    const result = await uc.execute("trim");

    expect(port.getOverview).toHaveBeenCalledWith("trim");
    expect(result).toBe(progressOverviewFixture);
  });

  it("GetProgressHistoryUseCase calls the port", async () => {
    const port = createMockPort();
    const result = await new GetProgressHistoryUseCase(port).execute();

    expect(port.getHistory).toHaveBeenCalledTimes(1);
    expect(result).toBe(progressHistoryFixture);
  });

  it("GetProgressMeasureUseCase forwards metric + period", async () => {
    const port = createMockPort();
    const result = await new GetProgressMeasureUseCase(port).execute("peso", "ano");

    expect(port.getMeasure).toHaveBeenCalledWith("peso", "ano");
    expect(result).toBe(progressMeasureDetailFixture);
  });

  it("GetProgressExerciseDetailUseCase forwards slug + metric", async () => {
    const port = createMockPort();
    const result = await new GetProgressExerciseDetailUseCase(port).execute(
      "press-banca",
      "volumen",
    );

    expect(port.getExerciseDetail).toHaveBeenCalledWith("press-banca", "volumen");
    expect(result).toBe(progressExerciseDetailFixture);
  });

  it("propagates port errors", async () => {
    const port = createMockPort({
      getOverview: jest.fn().mockRejectedValue(new Error("Server error")),
    });
    await expect(new GetProgressOverviewUseCase(port).execute()).rejects.toThrow(
      "Server error",
    );
  });
});
