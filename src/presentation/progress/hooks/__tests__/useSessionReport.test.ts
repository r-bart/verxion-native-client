import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useSessionReport } from "../useSessionReport";

describe("useSessionReport", () => {
  it("returns data from UC on success", async () => {
    const report = {
      sessionId: "s1",
      name: "Push Day",
      duration: 55,
      totalVolume: 8000,
      exercises: [{ name: "Bench Press", sets: 4 }],
    };
    const container = createMockContainer({
      getSessionReport: { execute: jest.fn().mockResolvedValue(report) },
    });

    const { result } = renderHookWithProviders(
      () => useSessionReport("s1"),
      { container }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(report);
    expect(container.getSessionReport.execute).toHaveBeenCalledWith("s1");
  });

  it("is disabled when sessionId is empty", () => {
    const container = createMockContainer({
      getSessionReport: { execute: jest.fn() },
    });

    const { result } = renderHookWithProviders(
      () => useSessionReport(""),
      { container }
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(container.getSessionReport.execute).not.toHaveBeenCalled();
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getSessionReport: { execute: jest.fn().mockRejectedValue(new Error("Error")) },
    });

    const { result } = renderHookWithProviders(
      () => useSessionReport("s1"),
      { container }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
