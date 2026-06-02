import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useMonths } from "../useMonths";

describe("useMonths", () => {
  it("returns data from UC on success", async () => {
    const months = [
      { month: "2026-03", sessions: 12, volume: 60000 },
      { month: "2026-02", sessions: 15, volume: 72000 },
    ];
    const container = createMockContainer({
      getMonths: { execute: jest.fn().mockResolvedValue(months) },
    });

    const { result } = renderHookWithProviders(() => useMonths(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(months);
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getMonths: { execute: jest.fn().mockRejectedValue(new Error("Error")) },
    });

    const { result } = renderHookWithProviders(() => useMonths(), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
