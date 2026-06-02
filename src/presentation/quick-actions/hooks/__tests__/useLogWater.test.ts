import { waitFor, act } from "@testing-library/react-native";
import {
  createMockContainer,
  createTestQueryClient,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useLogWater } from "../useLogWater";

describe("useLogWater", () => {
  it("calls UC.execute with correct amount", async () => {
    const executeMock = jest.fn().mockResolvedValue(undefined);
    const container = createMockContainer({
      logWater: { execute: executeMock },
    });

    const { result } = renderHookWithProviders(() => useLogWater(), { container });

    await act(async () => {
      result.current.mutate(250);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(executeMock).toHaveBeenCalledWith(250);
  });

  it("invalidates daily water query key on success", async () => {
    const container = createMockContainer({
      logWater: { execute: jest.fn().mockResolvedValue(undefined) },
    });
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    const today = new Date().toISOString().slice(0, 10);

    const { result } = renderHookWithProviders(() => useLogWater(), {
      container,
      queryClient,
    });

    await act(async () => {
      result.current.mutate(500);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["today", "water", today],
    });
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      logWater: { execute: jest.fn().mockRejectedValue(new Error("Failed")) },
    });

    const { result } = renderHookWithProviders(() => useLogWater(), { container });

    await act(async () => {
      result.current.mutate(250);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
