import { waitFor } from "@testing-library/react-native";
import { renderHookWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { sessionsSummaryFixture } from "@/domain/training/__fixtures__/sessionsSummaryFixture";
import { useSessionsSummary } from "../useSessionsSummary";

describe("useSessionsSummary", () => {
  it("resolves the sessions summary via the use case", async () => {
    const execute = jest.fn().mockResolvedValue(sessionsSummaryFixture);
    const container = createMockContainer({ getSessionsSummary: { execute } });

    const { result } = renderHookWithProviders(() => useSessionsSummary(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(sessionsSummaryFixture);
  });

  it("surfaces the error state when the use case rejects", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getSessionsSummary: { execute } });

    const { result } = renderHookWithProviders(() => useSessionsSummary(), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
