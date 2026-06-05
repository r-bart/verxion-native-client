import { formatRelativeTime } from "../relativeTime";

// Hermes on iOS lacks `Intl.RelativeTimeFormat`, so `formatRelativeTime` is a
// hand-rolled en/es formatter. These lock its output (Node's Intl would mask a
// regression to the old ICU path). Clock is pinned so offsets are deterministic.
const NOW = "2026-06-05T12:00:00Z";

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(NOW));
});

afterAll(() => {
  jest.useRealTimers();
});

describe("formatRelativeTime", () => {
  it("returns '' for null/undefined/blank/invalid input", () => {
    expect(formatRelativeTime(null, "en")).toBe("");
    expect(formatRelativeTime(undefined, "en")).toBe("");
    expect(formatRelativeTime("", "en")).toBe("");
    expect(formatRelativeTime("not-a-date", "en")).toBe("");
  });

  it("formats past durations (en)", () => {
    expect(formatRelativeTime("2026-06-05T10:00:00Z", "en")).toBe("2 hours ago");
    expect(formatRelativeTime("2026-06-04T12:00:00Z", "en")).toBe("1 day ago"); // singular
  });

  it("formats past durations (es)", () => {
    expect(formatRelativeTime("2026-06-05T10:00:00Z", "es")).toBe("hace 2 horas");
    expect(formatRelativeTime("2026-06-04T12:00:00Z", "es")).toBe("hace 1 día"); // singular
  });

  it("formats future durations", () => {
    expect(formatRelativeTime("2026-06-05T14:00:00Z", "en")).toBe("in 2 hours");
    expect(formatRelativeTime("2026-06-05T14:00:00Z", "es")).toBe("en 2 horas");
  });

  it("collapses sub-minute durations to 'just now'", () => {
    expect(formatRelativeTime("2026-06-05T11:59:30Z", "en")).toBe("just now");
    expect(formatRelativeTime("2026-06-05T11:59:30Z", "es")).toBe("hace un momento");
  });

  it("treats region-suffixed locales by language prefix", () => {
    expect(formatRelativeTime("2026-06-05T10:00:00Z", "es-ES")).toBe("hace 2 horas");
    expect(formatRelativeTime("2026-06-05T10:00:00Z", "en-US")).toBe("2 hours ago");
  });
});
