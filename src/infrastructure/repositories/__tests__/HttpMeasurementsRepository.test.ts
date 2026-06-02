import { HttpMeasurementsRepository } from "../HttpMeasurementsRepository";
import { apiClient } from "../../api/apiClient";
import type { WeightLog } from "@/domain/measurements/models/Measurement";

jest.mock("../../api/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;

describe("HttpMeasurementsRepository", () => {
  let repo: HttpMeasurementsRepository;

  beforeEach(() => {
    repo = new HttpMeasurementsRepository();
    jest.clearAllMocks();
  });

  describe("logWeight", () => {
    it("sends correct body to POST /measurements/weight", async () => {
      const mockLog: WeightLog = { id: "wl-1", weight: 79.5, unit: "kg", date: "2026-03-27" };
      mockPost.mockResolvedValue(mockLog);

      const result = await repo.logWeight(79.5, "2026-03-27T10:00:00Z");

      expect(mockPost).toHaveBeenCalledWith("/measurements/weight", {
        weightKg: 79.5,
        loggedAt: "2026-03-27T10:00:00Z",
      });
      expect(result).toEqual(mockLog);
    });
  });
});
