import { formatNumber, formatValue, formatDelta } from "../format";

describe("formatNumber (es-ES, hand-rolled)", () => {
  it("groups thousands with '.' and uses ',' for decimals", () => {
    expect(formatNumber(8214, 0)).toBe("8.214");
    expect(formatNumber(81.5, 1)).toBe("81,5");
    expect(formatNumber(1234.5, 1)).toBe("1.234,5");
    expect(formatNumber(1234567, 0)).toBe("1.234.567");
  });

  it("renders the unicode minus for negatives", () => {
    expect(formatNumber(-1.2, 1)).toBe("−1,2");
  });

  it("never emits a negative zero (tiny negatives that round to 0)", () => {
    expect(formatNumber(-0.04, 1)).toBe("0,0");
    expect(formatNumber(-0, 0)).toBe("0");
  });
});

describe("formatValue", () => {
  it("appends the unit with a space, '—' for null", () => {
    expect(formatValue(82.4, "kg", 1)).toBe("82,4 kg");
    expect(formatValue(92, "%", 0)).toBe("92 %");
    expect(formatValue(8214, "", 0)).toBe("8.214");
    expect(formatValue(null, "kg", 1)).toBe("—");
  });
});

describe("formatDelta (sign + good/bad tone)", () => {
  it("flags a drop as good when goodDown is true (weight)", () => {
    expect(formatDelta(-1.2, "kg", 1, true, "estable")).toEqual({
      text: "−1,2 kg",
      tone: "up",
    });
  });

  it("flags a rise as good when goodDown is false (volume)", () => {
    expect(formatDelta(2.5, "t", 1, false, "estable")).toEqual({
      text: "+2,5 t",
      tone: "up",
    });
  });

  it("flags the wrong direction as lava", () => {
    expect(formatDelta(1.2, "kg", 1, true, "estable").tone).toBe("lava");
  });

  it("reads as stable+neutral when the delta rounds to zero", () => {
    expect(formatDelta(0.04, "kg", 1, true, "estable")).toEqual({
      text: "estable",
      tone: "neutral",
    });
  });

  it("returns '—' neutral for a null delta", () => {
    expect(formatDelta(null, "kg", 1, true, "estable")).toEqual({
      text: "—",
      tone: "neutral",
    });
  });
});
