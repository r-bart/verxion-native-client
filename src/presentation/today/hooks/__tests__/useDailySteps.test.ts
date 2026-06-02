import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useDailySteps } from "../useDailySteps";

describe("useDailySteps", () => {
  it("returns step count from UC on success", async () => {
    const container = createMockContainer({
      getDailySteps: { execute: jest.fn().mockResolvedValue(8432) },
    });

    const { result } = renderHookWithProviders(() => useDailySteps(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(8432);
    const today = new Date().toISOString().slice(0, 10);
    expect(container.getDailySteps.execute).toHaveBeenCalledWith(today);
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getDailySteps: { execute: jest.fn().mockRejectedValue(new Error("API error")) },
    });

    const { result } = renderHookWithProviders(() => useDailySteps(), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
