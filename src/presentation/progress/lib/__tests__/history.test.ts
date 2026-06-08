import { bandAtWeek, valueAtWeek, lastKnownValueAtWeek, weeksAgo, fillForward } from "../history";
import type { HistoryBand, HistorySeries } from "@/domain/progress/models/Progress";

const bands: HistoryBand[] = [
  { label: "V", name: "Volumen", why: null, kind: "program", fromWeek: 0, toWeek: 18, isMajor: false },
  { label: "D", name: "Definición", why: "x", kind: "program", fromWeek: 18, toWeek: 29, isMajor: true },
];

describe("bandAtWeek", () => {
  it("returns the band containing the week (later band wins on the shared boundary)", () => {
    expect(bandAtWeek(bands, 5)?.name).toBe("Volumen");
    expect(bandAtWeek(bands, 18)?.name).toBe("Definición"); // overlap → last match
    expect(bandAtWeek(bands, 29)?.name).toBe("Definición");
  });
  it("returns null outside every band", () => {
    expect(bandAtWeek(bands, 99)).toBeNull();
    expect(bandAtWeek([], 0)).toBeNull();
  });
});

describe("valueAtWeek", () => {
  const series: HistorySeries = {
    key: "peso",
    unit: "kg",
    goodDown: true,
    points: [
      { week: 0, value: 80 },
      { week: 2, value: 82 },
    ],
  };
  it("returns the exact point when present", () => {
    expect(valueAtWeek(series, 2)).toBe(82);
  });
  it("falls back to the nearest point by week distance", () => {
    expect(valueAtWeek(series, 1)).toBe(80); // equidistant → first wins
    expect(valueAtWeek(series, 5)).toBe(82);
  });
  it("returns null for an empty series", () => {
    expect(valueAtWeek({ ...series, points: [] }, 0)).toBeNull();
  });
});

describe("lastKnownValueAtWeek", () => {
  const series: HistorySeries = {
    key: "peso",
    unit: "kg",
    goodDown: true,
    points: [
      { week: 0, value: 80 },
      { week: 1, value: null },
      { week: 2, value: 82 },
      { week: 3, value: null },
    ],
  };
  it("carries the last known value forward across a trailing null (no '—' while the curve draws)", () => {
    expect(lastKnownValueAtWeek(series, 3)).toBe(82);
  });
  it("returns the known value at the exact week", () => {
    expect(lastKnownValueAtWeek(series, 2)).toBe(82);
    expect(lastKnownValueAtWeek(series, 1)).toBe(80); // week 1 null → carry from week 0
  });
  it("uses the first known value for leading nulls", () => {
    const s = { ...series, points: [{ week: 0, value: null }, { week: 1, value: 5 }] };
    expect(lastKnownValueAtWeek(s, 0)).toBe(5);
  });
  it("returns null only for an empty or all-null series", () => {
    expect(lastKnownValueAtWeek({ ...series, points: [] }, 0)).toBeNull();
    expect(lastKnownValueAtWeek({ ...series, points: [{ week: 0, value: null }] }, 0)).toBeNull();
  });
});

describe("weeksAgo", () => {
  it("is 0 at the last week and grows backwards", () => {
    expect(weeksAgo(29, 30)).toBe(0);
    expect(weeksAgo(27, 30)).toBe(2);
    expect(weeksAgo(40, 30)).toBe(0); // clamped, never negative
  });
});

describe("fillForward", () => {
  it("carries the last known value across nulls", () => {
    expect(fillForward([80, null, null, 82])).toEqual([80, 80, 80, 82]);
  });
  it("back-fills leading nulls with the first known value", () => {
    expect(fillForward([null, null, 5])).toEqual([5, 5, 5]);
  });
  it("yields zeros only for an all-null series", () => {
    expect(fillForward([null, null])).toEqual([0, 0]);
  });
});
