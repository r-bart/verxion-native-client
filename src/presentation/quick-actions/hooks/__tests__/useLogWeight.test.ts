import { waitFor, act } from "@testing-library/react-native";
import {
  createMockContainer,
  createTestQueryClient,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useLogWeight } from "../useLogWeight";

describe("useLogWeight", () => {
  it("calls UC.execute with correct weight value", async () => {
    const executeMock = jest.fn().mockResolvedValue({ id: "w1", weight: 80.5, unit: "kg" });
    const container = createMockContainer({
      logWeight: { execute: executeMock },
    });

    const { result } = renderHookWithProviders(() => useLogWeight(), { container });

    await act(async () => {
      result.current.mutate(80.5);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(executeMock).toHaveBeenCalledWith(80.5);
  });

  it("invalidates todayKeys and progressKeys on success", async () => {
    const container = createMockContainer({
      logWeight: { execute: jest.fn().mockResolvedValue({ id: "w1" }) },
    });
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHookWithProviders(() => useLogWeight(), {
      container,
      queryClient,
    });

    await act(async () => {
      result.current.mutate(75);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Should invalidate both today and progress keys
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["today"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["progress"] });
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      logWeight: { execute: jest.fn().mockRejectedValue(new Error("Save failed")) },
    });

    const { result } = renderHookWithProviders(() => useLogWeight(), { container });

    await act(async () => {
      result.current.mutate(80);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Save failed");
  });
});
