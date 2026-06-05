import { waitFor } from "@testing-library/react-native";
import { renderHookWithProviders, createMockContainer } from "@/__tests__/test-utils";
import { routineDashboardFixture } from "@/domain/training/__fixtures__/routineDashboardFixture";
import { useRoutineDashboard } from "../useRoutineDashboard";

describe("useRoutineDashboard", () => {
  it("resolves the routine-dashboard aggregate via the use case", async () => {
    const execute = jest.fn().mockResolvedValue(routineDashboardFixture);
    const container = createMockContainer({ getRoutineDashboard: { execute } });

    const { result } = renderHookWithProviders(() => useRoutineDashboard(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(execute).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe(routineDashboardFixture);
  });

  it("surfaces the error state when the use case rejects", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("boom"));
    const container = createMockContainer({ getRoutineDashboard: { execute } });

    const { result } = renderHookWithProviders(() => useRoutineDashboard(), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
