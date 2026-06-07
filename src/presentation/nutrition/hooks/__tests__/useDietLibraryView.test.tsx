import { renderHook, act } from "@testing-library/react-native";
import { dietLibraryFixture } from "@/presentation/nutrition/lib/dietLibraryFixture";
import { useDietLibraryView } from "../useDietLibraryView";

describe("useDietLibraryView", () => {
  it("groups diets by state in browse mode (no active filter)", () => {
    const { result } = renderHook(() => useDietLibraryView(dietLibraryFixture));

    expect(result.current.filtering).toBe(false);
    expect(result.current.groups.active).toHaveLength(1);
    expect(result.current.groups.completed).toHaveLength(2);
    expect(result.current.groups.draft).toHaveLength(0);
  });

  it("search is accent-insensitive and flips to results mode", () => {
    const { result } = renderHook(() => useDietLibraryView(dietLibraryFixture));

    act(() => result.current.setQuery("definicion")); // matches "Definición" without the accent

    expect(result.current.filtering).toBe(true);
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].name).toBe("Definición · 2.250 kcal");
  });

  it("filters by the state facet and counts active filters", () => {
    const { result } = renderHook(() => useDietLibraryView(dietLibraryFixture));

    act(() => result.current.toggleState("active"));

    expect(result.current.filterCount).toBe(1);
    expect(result.current.results).toHaveLength(1);
    expect(result.current.results[0].state).toBe("active");
  });

  it("sorts by daily kcal, highest first", () => {
    const { result } = renderHook(() => useDietLibraryView(dietLibraryFixture));

    act(() => result.current.setSort("kcal"));

    expect(result.current.results.map((d) => d.targets.kcal)).toEqual([
      2900, 2500, 2250,
    ]);
  });

  it("sorts by adherence, highest first", () => {
    const { result } = renderHook(() => useDietLibraryView(dietLibraryFixture));

    act(() => result.current.setSort("adherence"));

    expect(result.current.results.map((d) => d.adherence)).toEqual([92, 90, 86]);
  });

  it("clearFilters resets state and goal selections", () => {
    const { result } = renderHook(() => useDietLibraryView(dietLibraryFixture));

    act(() => result.current.toggleState("completed"));
    act(() => result.current.toggleGoal("fat_loss"));
    expect(result.current.filterCount).toBe(2);

    act(() => result.current.clearFilters());
    expect(result.current.filterCount).toBe(0);
  });
});
