import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useTimeline } from "../useTimeline";

describe("useTimeline", () => {
  it("returns data from UC on success", async () => {
    const timeline = [
      { date: "2026-03-25", type: "session", title: "Push Day" },
      { date: "2026-03-23", type: "measurement", title: "Weight: 80kg" },
    ];
    const container = createMockContainer({
      getTimeline: { execute: jest.fn().mockResolvedValue(timeline) },
    });

    const { result } = renderHookWithProviders(() => useTimeline(3), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(timeline);
    expect(container.getTimeline.execute).toHaveBeenCalledWith(3);
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getTimeline: { execute: jest.fn().mockRejectedValue(new Error("Error")) },
    });

    const { result } = renderHookWithProviders(() => useTimeline(3), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
