import { act, renderHook } from "@testing-library/react-native";
import { useEntrenoSegment } from "../useEntrenoSegment";

// t echoes the key so option labels are assertable without loading i18n.
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

describe("useEntrenoSegment", () => {
  it("defaults to the routine segment and derives the three localized options", () => {
    const { result } = renderHook(() => useEntrenoSegment());

    expect(result.current.segment).toBe("routine");
    expect(result.current.options.map((o) => o.key)).toEqual(["routine", "sessions", "exercises"]);
    expect(result.current.options.map((o) => o.label)).toEqual([
      "training.segments.routine",
      "training.segments.sessions",
      "training.segments.exercises",
    ]);
  });

  it("honors an explicit initial segment", () => {
    const { result } = renderHook(() => useEntrenoSegment("exercises"));
    expect(result.current.segment).toBe("exercises");
  });

  it("switches the active segment", () => {
    const { result } = renderHook(() => useEntrenoSegment());

    act(() => result.current.setSegment("sessions"));
    expect(result.current.segment).toBe("sessions");
  });
});
