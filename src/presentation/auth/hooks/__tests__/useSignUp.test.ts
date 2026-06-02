import { waitFor, act } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useSignUp } from "../useSignUp";

describe("useSignUp", () => {
  it("returns data from UC on success", async () => {
    const container = createMockContainer({
      signUp: { execute: jest.fn().mockResolvedValue({ id: "u1" }) },
    });

    const { result } = renderHookWithProviders(() => useSignUp(), { container });

    await act(async () => {
      result.current.mutate({ name: "John", email: "john@test.com", password: "secure123" });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: "u1" });
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      signUp: { execute: jest.fn().mockRejectedValue(new Error("Email taken")) },
    });

    const { result } = renderHookWithProviders(() => useSignUp(), { container });

    await act(async () => {
      result.current.mutate({ name: "John", email: "taken@test.com", password: "pass" });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("Email taken");
  });
});
