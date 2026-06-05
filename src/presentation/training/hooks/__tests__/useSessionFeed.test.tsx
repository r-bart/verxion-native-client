import { waitFor } from "@testing-library/react-native";
import { renderHookWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { sessionFeedFixture } from "@/domain/training/__fixtures__/sessionFeedFixture";
import { useSessionFeed } from "../useSessionFeed";

describe("useSessionFeed", () => {
  it("merges page blocks and exposes the total count", async () => {
    const execute = jest.fn().mockResolvedValue(sessionFeedFixture);
    const container = createMockContainer({ getSessionFeed: { execute } });

    const { result } = renderHookWithProviders(() => useSessionFeed(null, "recent"), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.blocks).toHaveLength(sessionFeedFixture.blocks.length);
    expect(result.current.totalCount).toBe(sessionFeedFixture.totalCount);
    expect(execute).toHaveBeenCalledWith({ routineId: null, sort: "recent", cursor: null });
  });

  it("surfaces the error state when the use case rejects", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getSessionFeed: { execute } });

    const { result } = renderHookWithProviders(() => useSessionFeed(null, "recent"), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
