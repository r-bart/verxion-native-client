import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useDailyWater } from "../useDailyWater";

describe("useDailyWater", () => {
  it("returns water data from UC on success", async () => {
    const waterData = { totalMl: 1500, date: "2026-03-27", logs: [{ id: "1", amountMl: 500 }] };
    const container = createMockContainer({
      getDailyWater: { execute: jest.fn().mockResolvedValue(waterData) },
    });

    const { result } = renderHookWithProviders(() => useDailyWater(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(waterData);
    const today = new Date().toISOString().slice(0, 10);
    expect(container.getDailyWater.execute).toHaveBeenCalledWith(today);
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getDailyWater: { execute: jest.fn().mockRejectedValue(new Error("Server error")) },
    });

    const { result } = renderHookWithProviders(() => useDailyWater(), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
