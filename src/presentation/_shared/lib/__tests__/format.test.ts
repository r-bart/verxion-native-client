/**
 * @generated-from thoughts/specs/2026-03-28_per-set-progression-guidance.md
 * @immutable Do NOT modify these tests — implementation must make them pass as-is.
 *
 * These tests encode the spec's acceptance criteria as executable assertions.
 * If a test seems wrong, update the spec and regenerate — don't edit tests directly.
 */

import { formatWeight, formatVolume, formatRepRange } from "../format";

describe("formatWeight", () => {
  it("returns the weight in kg for a whole number", () => {
    // Spec: FR-3 (target display uses formatWeight)
    expect(formatWeight(60)).toBe("60kg");
  });

  it("rounds to nearest 0.5 and formats decimals correctly", () => {
    // Spec: FR-3
    expect(formatWeight(62.5)).toBe("62.5kg");
  });

  it("returns 'BW' for null (bodyweight exercises)", () => {
    // Spec: EC-1 — target.weight null (bodyweight)
    expect(formatWeight(null)).toBe("BW");
  });

  it("rounds up to nearest 0.5 from 0.26+", () => {
    // Spec: FR-3
    expect(formatWeight(60.3)).toBe("60.5kg");
  });

  it("rounds down to nearest 0.5 from 0.24-", () => {
    // Spec: FR-3
    expect(formatWeight(60.2)).toBe("60kg");
  });
});

describe("formatRepRange", () => {
  it("shows range with em-dash when min and max differ", () => {
    // Spec: FR-3 (Target row: formatRepRange used in NextSetGuide)
    expect(formatRepRange(8, 12)).toBe("8–12");
  });

  it("shows single number when min equals max", () => {
    // Spec: FR-3
    expect(formatRepRange(10, 10)).toBe("10");
  });
});

describe("formatVolume", () => {
  it("returns kg for values below 1000", () => {
    // Spec: FR-1 (last session volume display)
    expect(formatVolume(750)).toBe("750kg");
  });

  it("returns tonnes for values >= 1000", () => {
    // Spec: FR-1
    expect(formatVolume(1800)).toBe("1.8t");
  });

  it("rounds kg values to nearest integer", () => {
    // Spec: FR-1
    expect(formatVolume(750.7)).toBe("751kg");
  });
});
