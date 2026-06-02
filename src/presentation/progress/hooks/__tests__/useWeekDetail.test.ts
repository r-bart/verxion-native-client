import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useWeekDetail } from "../useWeekDetail";

describe("useWeekDetail", () => {
  it("returns data from UC on success", async () => {
    const detail = {
      weekStart: "2026-03-23",
      sessions: [{ id: "s1", name: "Push Day", date: "2026-03-23" }],
      totalVolume: 15000,
    };
    const container = createMockContainer({
      getWeekDetail: { execute: jest.fn().mockResolvedValue(detail) },
    });

    const { result } = renderHookWithProviders(
      () => useWeekDetail("2026-03-23"),
      { container }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(detail);
    expect(container.getWeekDetail.execute).toHaveBeenCalledWith("2026-03-23");
  });

  it("is disabled when weekDate is empty", () => {
    const container = createMockContainer({
      getWeekDetail: { execute: jest.fn() },
    });

    const { result } = renderHookWithProviders(
      () => useWeekDetail(""),
      { container }
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(container.getWeekDetail.execute).not.toHaveBeenCalled();
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getWeekDetail: { execute: jest.fn().mockRejectedValue(new Error("Error")) },
    });

    const { result } = renderHookWithProviders(
      () => useWeekDetail("2026-03-23"),
      { container }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
