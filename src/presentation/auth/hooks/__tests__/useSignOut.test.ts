import { waitFor, act } from "@testing-library/react-native";
import {
  createMockContainer,
  createTestQueryClient,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useSignOut } from "../useSignOut";

describe("useSignOut", () => {
  it("calls UC.execute on mutate", async () => {
    const executeMock = jest.fn().mockResolvedValue(undefined);
    const container = createMockContainer({
      signOut: { execute: executeMock },
    });

    const { result } = renderHookWithProviders(() => useSignOut(), { container });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(executeMock).toHaveBeenCalledTimes(1);
  });

  it("calls queryClient.clear() on success", async () => {
    const container = createMockContainer({
      signOut: { execute: jest.fn().mockResolvedValue(undefined) },
    });
    const queryClient = createTestQueryClient();
    const clearSpy = jest.spyOn(queryClient, "clear");

    const { result } = renderHookWithProviders(() => useSignOut(), {
      container,
      queryClient,
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(clearSpy).toHaveBeenCalledTimes(1);
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      signOut: { execute: jest.fn().mockRejectedValue(new Error("Logout failed")) },
    });

    const { result } = renderHookWithProviders(() => useSignOut(), { container });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
