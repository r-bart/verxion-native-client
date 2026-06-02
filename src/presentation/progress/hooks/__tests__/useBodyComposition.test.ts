import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useBodyComposition } from "../useBodyComposition";

describe("useBodyComposition", () => {
  it("returns data from UC on success", async () => {
    const bodyComp = {
      weightTrend: [{ date: "2026-03-20", value: 80 }],
      perimeterTrend: { chest: [{ date: "2026-03-20", value: 100 }] },
      currentWeight: 80,
      weightChange: -1.5,
    };
    const container = createMockContainer({
      getBodyComposition: { execute: jest.fn().mockResolvedValue(bodyComp) },
    });

    const { result } = renderHookWithProviders(
      () => useBodyComposition("30d"),
      { container }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(bodyComp);
    expect(container.getBodyComposition.execute).toHaveBeenCalledWith("30d");
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getBodyComposition: { execute: jest.fn().mockRejectedValue(new Error("Failed")) },
    });

    const { result } = renderHookWithProviders(
      () => useBodyComposition("30d"),
      { container }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
