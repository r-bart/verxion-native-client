import { waitFor, act } from "@testing-library/react-native";
import {
  createMockContainer,
  createTestQueryClient,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useSignIn } from "../useSignIn";

describe("useSignIn", () => {
  it("returns data from UC on success", async () => {
    const container = createMockContainer({
      signIn: { execute: jest.fn().mockResolvedValue({ token: "abc" }) },
    });

    const { result } = renderHookWithProviders(() => useSignIn(), { container });

    await act(async () => {
      result.current.mutate({ email: "test@test.com", password: "pass123" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ token: "abc" });
  });

  it("invalidates session query key on success", async () => {
    const container = createMockContainer({
      signIn: { execute: jest.fn().mockResolvedValue({ token: "abc" }) },
    });
    const queryClient = createTestQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHookWithProviders(() => useSignIn(), {
      container,
      queryClient,
    });

    await act(async () => {
      result.current.mutate({ email: "test@test.com", password: "pass123" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["auth", "session"],
    });
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      signIn: { execute: jest.fn().mockRejectedValue(new Error("Invalid credentials")) },
    });

    const { result } = renderHookWithProviders(() => useSignIn(), { container });

    await act(async () => {
      result.current.mutate({ email: "wrong@test.com", password: "bad" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Invalid credentials");
  });
});
