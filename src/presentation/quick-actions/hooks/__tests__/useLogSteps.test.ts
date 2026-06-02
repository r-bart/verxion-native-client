import { waitFor, act } from "@testing-library/react-native";
import {
  createMockContainer,
  createTestQueryClient,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useLogSteps } from "../useLogSteps";

describe("useLogSteps", () => {
  it("calls UC.execute with correct step count", async () => {
    const executeMock = jest.fn().mockResolvedValue({ id: "s1", steps: 10000, date: "2026-03-27" });
    const container = createMockContainer({
      logSteps: { execute: executeMock },
    });

    const { result } = renderHookWithProviders(() => useLogSteps(), { container });

    await act(async () => {
      result.current.mutate(10000);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(executeMock).toHaveBeenCalledWith(10000);
  });

  it("invalidates daily steps query key on success", async () => {
    const container = createMockContainer({
      logSteps: { execute: jest.fn().mockResolvedValue({ id: "s1" }) },
    });
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    const today = new Date().toISOString().slice(0, 10);

    const { result } = renderHookWithProviders(() => useLogSteps(), {
      container,
      queryClient,
    });

    await act(async () => {
      result.current.mutate(5000);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["today", "steps", today],
    });
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      logSteps: { execute: jest.fn().mockRejectedValue(new Error("Server error")) },
    });

    const { result } = renderHookWithProviders(() => useLogSteps(), { container });

    await act(async () => {
      result.current.mutate(999);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
