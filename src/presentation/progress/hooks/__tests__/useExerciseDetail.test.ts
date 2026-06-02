import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useExerciseDetail } from "../useExerciseDetail";

describe("useExerciseDetail", () => {
  it("returns data from UC on success", async () => {
    const detail = {
      exerciseId: "ex-1",
      name: "Bench Press",
      sessions: [{ date: "2026-03-20", maxWeight: 100, totalVolume: 5000 }],
    };
    const container = createMockContainer({
      getExerciseDetail: { execute: jest.fn().mockResolvedValue(detail) },
    });

    const { result } = renderHookWithProviders(
      () => useExerciseDetail("ex-1"),
      { container }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(detail);
    expect(container.getExerciseDetail.execute).toHaveBeenCalledWith("ex-1");
  });

  it("is disabled when exerciseId is empty", () => {
    const container = createMockContainer({
      getExerciseDetail: { execute: jest.fn() },
    });

    const { result } = renderHookWithProviders(
      () => useExerciseDetail(""),
      { container }
    );

    expect(result.current.fetchStatus).toBe("idle");
    expect(container.getExerciseDetail.execute).not.toHaveBeenCalled();
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getExerciseDetail: { execute: jest.fn().mockRejectedValue(new Error("Not found")) },
    });

    const { result } = renderHookWithProviders(
      () => useExerciseDetail("bad-id"),
      { container }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
