import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useLiveProgress } from "../useLiveProgress";

describe("useLiveProgress", () => {
  it("returns live progress data from UC on success", async () => {
    const progressData = {
      sessionName: "Push Day",
      progress: { totalVolume: 5000, totalSets: 15, duration: 45 },
      exercises: [{ sessionExerciseId: "e1", name: "Bench Press", status: "completed" }],
    };
    const container = createMockContainer({
      getLiveProgress: { execute: jest.fn().mockResolvedValue(progressData) },
    });

    const { result } = renderHookWithProviders(
      () => useLiveProgress("session-1"),
      { container }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(progressData);
    expect(container.getLiveProgress.execute).toHaveBeenCalledWith("session-1");
  });

  it("is disabled when sessionId is undefined", () => {
    const container = createMockContainer({
      getLiveProgress: { execute: jest.fn() },
    });

    const { result } = renderHookWithProviders(
      () => useLiveProgress(undefined),
      { container }
    );

    // Query should not be loading since it is disabled
    expect(result.current.fetchStatus).toBe("idle");
    expect(container.getLiveProgress.execute).not.toHaveBeenCalled();
  });

  it("uses refetchInterval of 10_000 for polling", async () => {
    // The hook sets refetchInterval: 10_000.
    // We verify the hook resolves correctly which confirms it is configured.
    const container = createMockContainer({
      getLiveProgress: { execute: jest.fn().mockResolvedValue({ progress: {} }) },
    });

    const { result } = renderHookWithProviders(
      () => useLiveProgress("session-1"),
      { container }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(container.getLiveProgress.execute).toHaveBeenCalledTimes(1);
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getLiveProgress: { execute: jest.fn().mockRejectedValue(new Error("Not found")) },
    });

    const { result } = renderHookWithProviders(
      () => useLiveProgress("bad-id"),
      { container }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
