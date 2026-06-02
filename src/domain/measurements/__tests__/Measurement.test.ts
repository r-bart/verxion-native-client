import type { WeightLog } from "../models/Measurement";

describe("Measurement Domain Models", () => {
  describe("WeightLog", () => {
    it("has id, weight, unit, and date", () => {
      const log: WeightLog = {
        id: "wl-1",
        weight: 79.5,
        unit: "kg",
        date: "2026-03-27",
      };
      expect(log.id).toBe("wl-1");
      expect(log.weight).toBe(79.5);
      expect(log.unit).toBe("kg");
      expect(log.date).toBe("2026-03-27");
    });

    it("supports different units", () => {
      const log: WeightLog = {
        id: "wl-2",
        weight: 175.0,
        unit: "lbs",
        date: "2026-03-27",
      };
      expect(log.unit).toBe("lbs");
    });
  });
});
