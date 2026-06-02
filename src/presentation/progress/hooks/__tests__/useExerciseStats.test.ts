import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useExerciseStats } from "../useExerciseStats";

describe("useExerciseStats", () => {
  it("returns data from UC on success", async () => {
    const stats = {
      totalVolume: 200000,
      totalSets: 500,
      uniqueExercises: 25,
      trainingDays: 60,
      muscleGroups: [{ name: "Chest", volume: 50000 }],
    };
    const container = createMockContainer({
      getExerciseStats: { execute: jest.fn().mockResolvedValue(stats) },
    });

    const { result } = renderHookWithProviders(() => useExerciseStats(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(stats);
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getExerciseStats: { execute: jest.fn().mockRejectedValue(new Error("Error")) },
    });

    const { result } = renderHookWithProviders(() => useExerciseStats(), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
