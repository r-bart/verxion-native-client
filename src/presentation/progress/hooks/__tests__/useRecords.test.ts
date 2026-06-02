import { waitFor } from "@testing-library/react-native";
import {
  createMockContainer,
  renderHookWithProviders,
} from "@/__tests__/test-utils";
import { useRecords } from "../useRecords";

describe("useRecords", () => {
  it("returns data from UC on success", async () => {
    const records = [
      { exerciseId: "ex-1", exerciseName: "Bench Press", weight: 120, reps: 1, date: "2026-03-20" },
      { exerciseId: "ex-2", exerciseName: "Squat", weight: 160, reps: 3, date: "2026-03-18" },
    ];
    const container = createMockContainer({
      getRecords: { execute: jest.fn().mockResolvedValue(records) },
    });

    const { result } = renderHookWithProviders(() => useRecords(), { container });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(records);
    expect(result.current.data).toHaveLength(2);
  });

  it("handles error state", async () => {
    const container = createMockContainer({
      getRecords: { execute: jest.fn().mockRejectedValue(new Error("Error")) },
    });

    const { result } = renderHookWithProviders(() => useRecords(), { container });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
