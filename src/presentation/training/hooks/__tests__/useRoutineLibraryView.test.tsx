import { renderHook, act } from "@testing-library/react-native";
import { routineLibraryFixture } from "@/domain/training/__fixtures__/routineLibraryFixture";
import { useRoutineLibraryView } from "../useRoutineLibraryView";

describe("useRoutineLibraryView", () => {
  it("groups routines by state in browse mode (no active filter)", () => {
    const { result } = renderHook(() =>
      useRoutineLibraryView(routineLibraryFixture)
    );

    expect(result.current.filtering).toBe(false);
    expect(result.current.groups.active).toHaveLength(1);
    expect(result.current.groups.completed).toHaveLength(2);
    expect(result.current.groups.draft).toHaveLength(0);
  });

  it("search is accent-insensitive and flips to results mode", () => {
    const { result } = renderHook(() =>
      useRoutineLibraryView(routineLibraryFixture)
    );

    act(() => result.current.setQuery("iniciacion")); // matches "Iniciación" without the accent

    expect(result.current.filtering).toBe(true);
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].name).toBe("Iniciación full-body");
  });

  it("filters by the state facet and counts active filters", () => {
    const { result } = renderHook(() =>
      useRoutineLibraryView(routineLibraryFixture)
    );

    act(() => result.current.toggleState("active"));

    expect(result.current.filterCount).toBe(1);
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].state).toBe("active");
  });

  it("sorts alphabetically by name", () => {
    const { result } = renderHook(() =>
      useRoutineLibraryView(routineLibraryFixture)
    );

    act(() => result.current.setSort("name"));

    expect(result.current.results.map((r) => r.name)).toEqual([
      "Iniciación full-body",
      "PPL base",
      "PPL Hipertrofia",
    ]);
  });

  it("clearFilters resets state and goal selections", () => {
    const { result } = renderHook(() =>
      useRoutineLibraryView(routineLibraryFixture)
    );

    act(() => result.current.toggleState("completed"));
    act(() => result.current.toggleGoal("Hipertrofia"));
    expect(result.current.filterCount).toBe(2);

    act(() => result.current.clearFilters());
    expect(result.current.filterCount).toBe(0);
  });
});
