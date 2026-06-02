import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useProgressOverview } from "../useProgressOverview";

describe("useProgressOverview", () => {
  it("returns data from UC on success", async () => {
    const overview = {
      totalSessions: 42,
      totalVolume: 150000,
      totalDuration: 1260,
      currentStreak: 5,
      weekSummary: { sessions: 3, volume: 12000, adherence: 60 },
    };
    const container = createMockContainer({
      getProgressOverview: { execute: jest.fn().mockResolvedValue(overview) },
    });

    const { result } = renderHookWithProviders(() => useProgressOverview(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(overview);
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getProgressOverview: { execute: jest.fn().mockRejectedValue(new Error("Failed")) },
    });

    const { result } = renderHookWithProviders(() => useProgressOverview(), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
