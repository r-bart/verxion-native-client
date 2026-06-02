import type { StepLog, DailyWater } from "../models/Activity";

describe("Activity Domain Models", () => {
  describe("StepLog", () => {
    it("has id, steps, and date", () => {
      const log: StepLog = {
        id: "step-1",
        steps: 8500,
        date: "2026-03-27",
      };
      expect(log.id).toBe("step-1");
      expect(log.steps).toBe(8500);
      expect(log.date).toBe("2026-03-27");
    });

    it("supports zero steps", () => {
      const log: StepLog = {
        id: "step-2",
        steps: 0,
        date: "2026-03-26",
      };
      expect(log.steps).toBe(0);
    });
  });

  describe("DailyWater", () => {
    it("has totalMl, date, and logs array", () => {
      const water: DailyWater = {
        totalMl: 2500,
        date: "2026-03-27",
        logs: [
          { id: "w-1", amountMl: 500, loggedAt: "2026-03-27T08:00:00Z" },
          { id: "w-2", amountMl: 750, loggedAt: "2026-03-27T12:00:00Z" },
          { id: "w-3", amountMl: 1250, loggedAt: "2026-03-27T18:00:00Z" },
        ],
      };
      expect(water.totalMl).toBe(2500);
      expect(water.logs).toHaveLength(3);
      expect(water.logs[0].amountMl).toBe(500);
    });

    it("supports empty logs", () => {
      const water: DailyWater = {
        totalMl: 0,
        date: "2026-03-27",
        logs: [],
      };
      expect(water.totalMl).toBe(0);
      expect(water.logs).toHaveLength(0);
    });
  });
});
