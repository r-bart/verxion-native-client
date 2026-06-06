import { waitFor, act } from "@testing-library/react-native";
import {
  createMockContainer,
  createTestQueryClient,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useSignOut } from "../useSignOut";

const mockReplace = jest.fn();
const mockDismissAll = jest.fn();
const mockCanDismiss = jest.fn(() => false);
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    dismissAll: mockDismissAll,
    canDismiss: mockCanDismiss,
  }),
}));

describe("useSignOut", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockDismissAll.mockClear();
    mockCanDismiss.mockClear().mockReturnValue(false);
  });

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

  it("redirects to the login screen on success", async () => {
    const container = createMockContainer({
      signOut: { execute: jest.fn().mockResolvedValue(undefined) },
    });

    const { result } = renderHookWithProviders(() => useSignOut(), { container });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
  });

  it("pops any pushed screens before redirecting (e.g. signing out from settings)", async () => {
    mockCanDismiss.mockReturnValue(true);
    const container = createMockContainer({
      signOut: { execute: jest.fn().mockResolvedValue(undefined) },
    });

    const { result } = renderHookWithProviders(() => useSignOut(), { container });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockDismissAll).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
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

  it("still clears and redirects to login when sign-out fails", async () => {
    // The expo client wipes the local session before the network call, so a
    // failed request still means we're logged out — logout must complete.
    const container = createMockContainer({
      signOut: { execute: jest.fn().mockRejectedValue(new Error("Logout failed")) },
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

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(clearSpy).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/(auth)/login");
  });
});
