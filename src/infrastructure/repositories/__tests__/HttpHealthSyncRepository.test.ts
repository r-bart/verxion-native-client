import { HttpHealthSyncRepository } from "../HttpHealthSyncRepository";
import { apiClient } from "../../api/apiClient";
import { ApiError } from "@/domain/_shared/errors";
import type {
  WeightSample,
  CardioSample,
  StepsDailyAggregate,
} from "@/domain/health/models/HealthSync";

jest.mock("../../api/apiClient", () => ({
  apiClient: {
    post: jest.fn(),
    del: jest.fn(),
  },
}));

const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
const mockDel = apiClient.del as jest.MockedFunction<typeof apiClient.del>;

describe("HttpHealthSyncRepository", () => {
  let repo: HttpHealthSyncRepository;

  beforeEach(() => {
    repo = new HttpHealthSyncRepository();
    jest.clearAllMocks();
  });

  it("pushWeight posts to /measurements/weight with source + externalId", async () => {
    const sample: WeightSample = { externalId: "uuid-w1", weightKg: 81.2, loggedAt: "2026-06-08T07:00:00Z" };
    await repo.pushWeight(sample);
    expect(mockPost).toHaveBeenCalledWith("/measurements/weight", {
      weightKg: 81.2,
      loggedAt: "2026-06-08T07:00:00Z",
      source: "apple_health",
      externalId: "uuid-w1",
    });
  });

  it("pushCardio posts to /activity/cardio with source, externalId and HR", async () => {
    const sample: CardioSample = {
      externalId: "uuid-c1",
      activityType: "run",
      durationMinutes: 42,
      loggedDate: "2026-06-08",
      distanceKm: 8.1,
      caloriesBurned: 520,
      avgHeartRate: 152,
      maxHeartRate: 178,
    };
    await repo.pushCardio(sample);
    expect(mockPost).toHaveBeenCalledWith("/activity/cardio", {
      activityType: "run",
      durationMinutes: 42,
      loggedDate: "2026-06-08",
      distanceKm: 8.1,
      caloriesBurned: 520,
      source: "apple_health",
      externalId: "uuid-c1",
      avgHeartRate: 152,
      maxHeartRate: 178,
    });
  });

  it("upsertSteps posts to /activity/steps/upsert using dataSource (not source)", async () => {
    const day: StepsDailyAggregate = {
      loggedDate: "2026-06-08",
      totalSteps: 9210,
      confidenceScore: 0.9,
      distanceKm: 6.7,
      caloriesBurned: 310,
      activeMinutes: 64,
    };
    await repo.upsertSteps(day);
    expect(mockPost).toHaveBeenCalledWith("/activity/steps/upsert", {
      totalSteps: 9210,
      loggedDate: "2026-06-08",
      dataSource: "apple_health",
      confidenceScore: 0.9,
      distanceKm: 6.7,
      caloriesBurned: 310,
      activeMinutes: 64,
    });
  });

  it("deleteWeightByExternal hits the by-external route with the apple_health source and encoded id", async () => {
    await repo.deleteWeightByExternal("uuid/with space");
    expect(mockDel).toHaveBeenCalledWith(
      "/measurements/weight/by-external/apple_health/uuid%2Fwith%20space",
    );
  });

  it("deleteCardioByExternal hits the by-external route with the apple_health source", async () => {
    mockDel.mockResolvedValue(undefined);
    await repo.deleteCardioByExternal("uuid-c1");
    expect(mockDel).toHaveBeenCalledWith(
      "/activity/cardio/by-external/apple_health/uuid-c1",
    );
  });

  it("swallows a 404 on delete (already gone — idempotent)", async () => {
    mockDel.mockRejectedValue(new ApiError("Not found", 404, "NOT_FOUND"));
    await expect(repo.deleteWeightByExternal("gone")).resolves.toBeUndefined();
  });

  it("propagates non-404 errors on delete", async () => {
    mockDel.mockRejectedValue(new ApiError("Server error", 500));
    await expect(repo.deleteCardioByExternal("x")).rejects.toThrow("Server error");
  });
});
