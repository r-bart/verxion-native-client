import { HttpProgressRepository } from "../HttpProgressRepository";
import { apiClient } from "../../api/apiClient";

jest.mock("../../api/apiClient", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;

describe("HttpProgressRepository", () => {
  let repo: HttpProgressRepository;

  beforeEach(() => {
    repo = new HttpProgressRepository();
    jest.clearAllMocks();
    mockGet.mockResolvedValue({} as never);
  });

  describe("getOverview", () => {
    it("GETs /progress with no params by default", async () => {
      await repo.getOverview();
      expect(mockGet).toHaveBeenCalledWith("/progress", undefined);
    });

    it("forwards the period query param", async () => {
      await repo.getOverview("trim");
      expect(mockGet).toHaveBeenCalledWith("/progress", { period: "trim" });
    });
  });

  describe("getHistory", () => {
    it("GETs /progress/history with no params by default", async () => {
      await repo.getHistory();
      expect(mockGet).toHaveBeenCalledWith("/progress/history", undefined);
    });

    it("forwards the today query param", async () => {
      await repo.getHistory("2026-06-02");
      expect(mockGet).toHaveBeenCalledWith("/progress/history", { today: "2026-06-02" });
    });
  });

  describe("getMeasure", () => {
    it("GETs /progress/measure/{metric} with the period param", async () => {
      await repo.getMeasure("peso", "ano");
      expect(mockGet).toHaveBeenCalledWith("/progress/measure/peso", { period: "ano" });
    });

    it("omits the param when period is undefined and encodes the metric", async () => {
      await repo.getMeasure("cintura");
      expect(mockGet).toHaveBeenCalledWith("/progress/measure/cintura", undefined);
    });
  });

  describe("getExerciseDetail", () => {
    it("GETs /progress/exercise/{slug} with the metric param", async () => {
      await repo.getExerciseDetail("press-banca", "volumen");
      expect(mockGet).toHaveBeenCalledWith("/progress/exercise/press-banca", {
        metric: "volumen",
      });
    });

    it("omits the param when metric is undefined", async () => {
      await repo.getExerciseDetail("press-banca");
      expect(mockGet).toHaveBeenCalledWith("/progress/exercise/press-banca", undefined);
    });
  });
});
