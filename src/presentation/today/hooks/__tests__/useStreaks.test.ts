import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useStreaks } from "../useStreaks";

describe("useStreaks", () => {
  it("returns streak data from UC on success", async () => {
    const streakData = { current: 5, longest: 12, lastActiveDate: "2026-03-26" };
    const container = createMockContainer({
      getStreaks: { execute: jest.fn().mockResolvedValue(streakData) },
    });

    const { result } = renderHookWithProviders(() => useStreaks(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(streakData);
    expect(container.getStreaks.execute).toHaveBeenCalledTimes(1);
  });

  it("handles loading state", () => {
    const container = createMockContainer({
      getStreaks: { execute: jest.fn().mockReturnValue(new Promise(() => {})) },
    });

    const { result } = renderHookWithProviders(() => useStreaks(), { container });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getStreaks: { execute: jest.fn().mockRejectedValue(new Error("Network error")) },
    });

    const { result } = renderHookWithProviders(() => useStreaks(), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
