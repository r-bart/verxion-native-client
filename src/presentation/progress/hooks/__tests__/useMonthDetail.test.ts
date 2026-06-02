import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useMonthDetail } from "../useMonthDetail";

describe("useMonthDetail", () => {
  it("returns data from UC on success", async () => {
    const detail = {
      month: "2026-03",
      totalSessions: 12,
      totalVolume: 60000,
      comparison: { volumeChange: 5, sessionsChange: -1 },
    };
    const container = createMockContainer({
      getMonthDetail: { execute: jest.fn().mockResolvedValue(detail) },
    });

    const { result } = renderHookWithProviders(
      () => useMonthDetail("2026-03"),
      { container }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(detail);
    expect(container.getMonthDetail.execute).toHaveBeenCalledWith("2026-03");
  });

  it("is disabled when period is empty", () => {
    const container = createMockContainer({
      getMonthDetail: { execute: jest.fn() },
    });

    const { result } = renderHookWithProviders(
      () => useMonthDetail(""),
      { container }
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(container.getMonthDetail.execute).not.toHaveBeenCalled();
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getMonthDetail: { execute: jest.fn().mockRejectedValue(new Error("Error")) },
    });

    const { result } = renderHookWithProviders(
      () => useMonthDetail("2026-03"),
      { container }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
