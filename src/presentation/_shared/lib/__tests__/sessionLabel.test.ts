import { formatSessionLabel } from "../sessionLabel";

describe("formatSessionLabel", () => {
  it("returns '' for null/undefined/blank", () => {
    expect(formatSessionLabel(null)).toBe("");
    expect(formatSessionLabel(undefined)).toBe("");
    expect(formatSessionLabel("   ")).toBe("");
  });

  it("distils iPhone Safari to 'Safari · iPhone'", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1";
    expect(formatSessionLabel(ua)).toBe("Safari · iPhone");
  });

  it("detects Chrome on Mac before falling through to Safari", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
    expect(formatSessionLabel(ua)).toBe("Chrome · Mac");
  });

  it("detects Edge before Chrome", () => {
    const ua =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 Edg/124.0";
    expect(formatSessionLabel(ua)).toBe("Edge · Windows");
  });

  it("detects Firefox on Android", () => {
    const ua = "Mozilla/5.0 (Android 14; Mobile; rv:125.0) Gecko/125.0 Firefox/125.0";
    expect(formatSessionLabel(ua)).toBe("Firefox · Android");
  });

  it("leaves a non-UA string (e.g. an OAuth app name) untouched", () => {
    expect(formatSessionLabel("Claude (MCP)")).toBe("Claude (MCP)");
  });
});
