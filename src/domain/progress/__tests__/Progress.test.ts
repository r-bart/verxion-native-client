import {
  progressOverviewFixture,
  progressHistoryFixture,
  progressMeasureDetailFixture,
  progressExerciseDetailFixture,
} from "../__fixtures__/progressFixtures";

describe("Progress domain read-models (fixtures)", () => {
  describe("ProgressOverview", () => {
    it("declares a period, a setup per domain and a dataState", () => {
      expect(progressOverviewFixture.period).toBe("mes");
      expect(progressOverviewFixture.dataState).toBe("full");
      expect(progressOverviewFixture.setup).toEqual({
        routine: "active",
        dietPlan: "active",
        program: "active",
      });
    });

    it("each metric is self-describing (unit/dec/goodDown) with a sparkline", () => {
      for (const m of progressOverviewFixture.metrics) {
        expect(typeof m.key).toBe("string");
        expect(typeof m.unit).toBe("string");
        expect(typeof m.goodDown).toBe("boolean");
        expect(Array.isArray(m.spark)).toBe(true);
        expect(m.spark.length).toBeGreaterThan(0);
      }
    });

    it("carries the latest strength PR (no global index in v1)", () => {
      expect(progressOverviewFixture.strengthPr?.slug).toBe("press-banca");
      expect(progressOverviewFixture.strengthPr?.bestWeightKg).toBe(82.5);
    });
  });

  describe("ProgressHistory", () => {
    it("has the 3 lanes over a 30-week axis", () => {
      expect(progressHistoryFixture.weeks).toBe(30);
      expect(progressHistoryFixture.series.map((s) => s.key)).toEqual([
        "peso",
        "volumen",
        "adherencia",
      ]);
      for (const s of progressHistoryFixture.series) {
        expect(s.points).toHaveLength(30);
      }
    });

    it("phase bands carry the narrative name + why; the cut is the major band", () => {
      const major = progressHistoryFixture.bands.find((b) => b.isMajor);
      expect(major?.name).toBe("Verano ligero y fuerte");
      expect(major?.why).not.toBeNull();
    });

    it("prMarks reference navigable exercise slugs", () => {
      for (const pr of progressHistoryFixture.prMarks) {
        expect(typeof pr.slug).toBe("string");
        expect(pr.slug.length).toBeGreaterThan(0);
      }
    });
  });

  describe("ProgressMeasureDetail", () => {
    it("exposes a hero window + chart + weekly records with deltaPrev", () => {
      expect(progressMeasureDetailFixture.metric).toBe("peso");
      expect(progressMeasureDetailFixture.goal).toBe(79);
      expect(progressMeasureDetailFixture.window.key).toBe("peso");
      expect(progressMeasureDetailFixture.chart.length).toBeGreaterThan(0);
      expect(progressMeasureDetailFixture.records[0].deltaPrev).not.toBeUndefined();
    });
  });

  describe("ProgressExerciseDetail", () => {
    it("bridges to the exercise library via id + slug", () => {
      expect(progressExerciseDetailFixture.id).toBe("ex_press_banca");
      expect(progressExerciseDetailFixture.slug).toBe("press-banca");
    });

    it("carries kpis, an e1RM curve and per-session history", () => {
      expect(progressExerciseDetailFixture.kpis.e1rmKg).toBe(104);
      expect(progressExerciseDetailFixture.curve.length).toBeGreaterThan(0);
      expect(progressExerciseDetailFixture.history[0].isPr).toBe(true);
      expect(progressExerciseDetailFixture.empty).toBe(false);
    });
  });
});
