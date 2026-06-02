import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useSession } from "../useSession";

describe("useSession", () => {
  it("returns session data from UC on success", async () => {
    const session = {
      user: { id: "u1", name: "John Doe", email: "john@test.com" },
      expiresAt: "2026-04-27",
    };
    const container = createMockContainer({
      getSession: { execute: jest.fn().mockResolvedValue(session) },
    });

    const { result } = renderHookWithProviders(() => useSession(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(session);
  });

  it("returns null when no session exists", async () => {
    const container = createMockContainer({
      getSession: { execute: jest.fn().mockResolvedValue(null) },
    });

    const { result } = renderHookWithProviders(() => useSession(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getSession: { execute: jest.fn().mockRejectedValue(new Error("Unauthorized")) },
    });

    const { result } = renderHookWithProviders(() => useSession(), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
