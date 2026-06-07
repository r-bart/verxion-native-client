import { goalLabel, supplementTimingLabel } from "../labels";

// A minimal i18next-shaped stub: resolves known keys from a table, otherwise
// returns the provided defaultValue (mirrors i18next's missing-key behaviour).
const table: Record<string, string> = {
  "nutrition.goal.muscle_gain": "Ganar músculo",
  "nutrition.supplementTiming.post_workout": "Post-entreno",
};
const t = ((key: string, opts?: { defaultValue?: string }) =>
  table[key] ?? opts?.defaultValue ?? key) as any;

describe("nutrition labels", () => {
  it("maps a known goal token to its label", () => {
    expect(goalLabel("muscle_gain", t)).toBe("Ganar músculo");
  });

  it("maps a known supplement timing token to its label", () => {
    expect(supplementTimingLabel("post_workout", t)).toBe("Post-entreno");
  });

  it("humanizes an unmapped token instead of showing it raw", () => {
    expect(goalLabel("body_recomposition", t)).toBe("Body recomposition");
    expect(supplementTimingLabel("before_bed", t)).toBe("Before bed");
  });
});
