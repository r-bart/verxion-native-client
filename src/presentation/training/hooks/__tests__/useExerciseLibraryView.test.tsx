import { act, renderHook } from "@testing-library/react-native";
import { exerciseLibraryFixture } from "@/domain/training/__fixtures__/exerciseLibraryFixture";
import { useExerciseLibraryView } from "../useExerciseLibraryView";

describe("useExerciseLibraryView", () => {
  it("sorts alphabetically by default", () => {
    const { result } = renderHook(() => useExerciseLibraryView(exerciseLibraryFixture));
    const names = result.current.filtered.map((e) => e.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("searches accent- and case-insensitively across name, muscle and equipment", () => {
    const { result } = renderHook(() => useExerciseLibraryView(exerciseLibraryFixture));
    act(() => result.current.setQuery("biceps")); // matches "Curl de bíceps"
    expect(result.current.filtered.some((e) => e.name === "Curl de bíceps")).toBe(true);
    expect(result.current.filtered.every((e) => e.name === "Curl de bíceps")).toBe(true);
  });

  it("filters by group and equipment", () => {
    const { result } = renderHook(() => useExerciseLibraryView(exerciseLibraryFixture));
    act(() => result.current.setGroup("Pierna"));
    expect(result.current.filtered.length).toBeGreaterThan(0);
    expect(result.current.filtered.every((e) => e.group === "Pierna")).toBe(true);

    act(() => result.current.setEquipment("Barra"));
    expect(result.current.filtered.every((e) => e.group === "Pierna" && e.equipment === "Barra")).toBe(true);
  });

  it("sorts by log count when sort = logged", () => {
    const { result } = renderHook(() => useExerciseLibraryView(exerciseLibraryFixture));
    act(() => result.current.setSort("logged"));
    const counts = result.current.filtered.map((e) => e.logCount);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });
});
