import {
  fmtDecimal,
  fmtTonnes,
  fmtMinutes,
  fmtSet,
  fmtPrescription,
  fmtSessionDate,
  fmtFeedDay,
  fmtFeedMonth,
  fmtDateRange,
} from "../sessionFormat";

describe("sessionFormat", () => {
  it("fmtDecimal uses a comma in es and a point in en", () => {
    expect(fmtDecimal("es", 16.3)).toBe("16,3");
    expect(fmtDecimal("en", 16.3)).toBe("16.3");
    expect(fmtDecimal("es-ES", 23)).toBe("23"); // integers stay integer
  });

  it("fmtTonnes divides kg by 1000 per locale", () => {
    expect(fmtTonnes("es", 16300)).toBe("16,3");
    expect(fmtTonnes("en", 5200)).toBe("5.2");
  });

  it("fmtMinutes rounds seconds to whole minutes", () => {
    expect(fmtMinutes(3960)).toBe("66");
    expect(fmtMinutes(3930)).toBe("66");
  });

  it("fmtSet renders weight × reps per locale", () => {
    expect(fmtSet("es", { weight: 82.5, reps: 8 })).toBe("82,5 × 8");
    expect(fmtSet("en", { weight: 82.5, reps: 8 })).toBe("82.5 × 8");
  });

  it("fmtPrescription joins sets/reps/RIR and tolerates nulls", () => {
    expect(fmtPrescription("es", { sets: 4, reps: "6-8", rir: 2 })).toBe(
      "4×6-8 · RIR 2"
    );
    expect(
      fmtPrescription("es", { sets: null, reps: "AMRAP", rir: null })
    ).toBe("AMRAP");
    expect(fmtPrescription("es", null)).toBe("");
  });

  it("fmtSessionDate localizes weekday + month, empty on null/invalid", () => {
    // 2026-05-31 (noon UTC avoids TZ rollover) is a Sunday.
    expect(fmtSessionDate("es", "2026-05-31T12:00:00.000Z")).toBe(
      "Domingo · 31 may"
    );
    expect(fmtSessionDate("en", "2026-05-31T12:00:00.000Z")).toBe(
      "Sunday · 31 May"
    );
    expect(fmtSessionDate("es", null)).toBe("");
    expect(fmtSessionDate("es", "not-a-date")).toBe("");
  });

  it("fmtFeedDay renders short weekday + day, empty on null/invalid", () => {
    expect(fmtFeedDay("es", "2026-05-31T12:00:00.000Z")).toBe("Dom 31");
    expect(fmtFeedDay("en", "2026-05-31T12:00:00.000Z")).toBe("Sun 31");
    expect(fmtFeedDay("es", null)).toBe("");
    expect(fmtFeedDay("es", "not-a-date")).toBe("");
  });

  it("fmtFeedMonth renders the localized short month, empty on null/invalid", () => {
    expect(fmtFeedMonth("es", "2026-05-31T12:00:00.000Z")).toBe("may");
    expect(fmtFeedMonth("en", "2026-05-31T12:00:00.000Z")).toBe("May");
    expect(fmtFeedMonth("es", null)).toBe("");
  });

  it("fmtDateRange compacts same-month, expands across months, adds year across years", () => {
    expect(
      fmtDateRange("es", "2026-05-12T12:00:00.000Z", "2026-05-31T12:00:00.000Z")
    ).toBe("12-31 may");
    expect(
      fmtDateRange("es", "2026-01-06T12:00:00.000Z", "2026-02-28T12:00:00.000Z")
    ).toBe("6 ene – 28 feb");
    expect(
      fmtDateRange("es", "2025-12-28T12:00:00.000Z", "2026-01-05T12:00:00.000Z")
    ).toBe("28 dic 2025 – 5 ene 2026");
    expect(fmtDateRange("es", "x", "y")).toBe("");
  });
});
