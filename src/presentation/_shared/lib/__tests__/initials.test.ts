import { initials } from "../initials";

describe("initials", () => {
  it("takes first + last initials from a full name", () => {
    expect(initials("Álvaro Vázquez", null, null)).toBe("ÁV");
  });

  it("collapses extra whitespace and uses first + last words", () => {
    expect(initials("  Ana   María   López ", null, null)).toBe("AL");
  });

  it("returns a single letter for a one-word name", () => {
    expect(initials("Roberto", null, null)).toBe("R");
  });

  it("falls back to username when there is no name", () => {
    expect(initials(null, "rawbrt", null)).toBe("R");
  });

  it("falls back to the email local-part when there is no name or username", () => {
    expect(initials(null, null, "roberto.dzbt@gmail.com")).toBe("R");
  });

  it("prefers name over username over email", () => {
    expect(initials("Kilo Watt", "zzz", "aaa@x.com")).toBe("KW");
  });

  it("returns a placeholder when there is nothing to show", () => {
    expect(initials(null, null, null)).toBe("·");
    expect(initials("   ", "", "")).toBe("·");
  });
});
