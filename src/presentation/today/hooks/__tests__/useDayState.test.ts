import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useDayState } from "../useDayState";

describe("useDayState", () => {
  it("returns day state data from UC on success", async () => {
    const dayState = {
      state: "TRAINING_DAY",
      sessionsToday: 1,
      weekSessions: 3,
      weekTarget: 5,
    };
    const container = createMockContainer({
      getDayState: { execute: jest.fn().mockResolvedValue(dayState) },
    });

    const { result } = renderHookWithProviders(() => useDayState(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(dayState);
    // Should pass today's date string
    const today = new Date().toISOString().slice(0, 10);
    expect(container.getDayState.execute).toHaveBeenCalledWith(today);
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getDayState: { execute: jest.fn().mockRejectedValue(new Error("Failed")) },
    });

    const { result } = renderHookWithProviders(() => useDayState(), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
