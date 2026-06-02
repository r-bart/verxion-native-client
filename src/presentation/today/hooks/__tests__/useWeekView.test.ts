import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useWeekView } from "../useWeekView";

describe("useWeekView", () => {
  it("returns week view data from UC on success", async () => {
    const weekData = {
      days: [
        { date: "2026-03-23", completed: true },
        { date: "2026-03-24", completed: false },
      ],
    };
    const container = createMockContainer({
      getWeekView: { execute: jest.fn().mockResolvedValue(weekData) },
    });

    const { result } = renderHookWithProviders(() => useWeekView(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(weekData);
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getWeekView: { execute: jest.fn().mockRejectedValue(new Error("Timeout")) },
    });

    const { result } = renderHookWithProviders(() => useWeekView(), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
