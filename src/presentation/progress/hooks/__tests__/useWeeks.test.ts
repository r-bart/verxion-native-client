import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useWeeks } from "../useWeeks";

describe("useWeeks", () => {
  it("returns data from UC on success", async () => {
    const weeks = [
      { weekStart: "2026-03-23", sessions: 3, volume: 15000 },
      { weekStart: "2026-03-16", sessions: 4, volume: 18000 },
    ];
    const container = createMockContainer({
      getWeeks: { execute: jest.fn().mockResolvedValue(weeks) },
    });

    const { result } = renderHookWithProviders(() => useWeeks(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(weeks);
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getWeeks: { execute: jest.fn().mockRejectedValue(new Error("Error")) },
    });

    const { result } = renderHookWithProviders(() => useWeeks(), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
