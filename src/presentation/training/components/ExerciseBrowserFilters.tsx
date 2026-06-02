import { View, Pressable, ActionSheetIOS, Platform } from "react-native";
import { SlidersHorizontal } from "lucide-react-native";
import { SearchBar } from "@/presentation/_shared/components/SearchBar";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";
import type { ExerciseFiltersData } from "@/domain/training/models/Exercise";

export interface ExerciseBrowserFilterState {
  q: string;
  bodyPart?: string;
  equipment?: string;
  target?: string;
  customOnly?: boolean;
}

interface ExerciseBrowserFiltersProps {
  filters: ExerciseBrowserFilterState;
  onFiltersChange: (filters: ExerciseBrowserFilterState) => void;
  filterOptions?: ExerciseFiltersData;
}

export function ExerciseBrowserFilters({
  filters,
  onFiltersChange,
  filterOptions,
}: ExerciseBrowserFiltersProps) {
  const activeCount = [filters.bodyPart, filters.equipment, filters.target, filters.customOnly].filter(Boolean).length;

  const openFilterSheet = () => {
    if (Platform.OS !== "ios") return;

    const categories = [
      { label: "Body Part", key: "bodyPart" as const, options: filterOptions?.bodyParts ?? [] },
      { label: "Equipment", key: "equipment" as const, options: filterOptions?.equipment ?? [] },
      { label: "Target Muscle", key: "target" as const, options: filterOptions?.muscleTargets ?? [] },
    ];

    const sheetOptions = [
      ...categories.map((c) => {
        const current = filters[c.key];
        return current ? `${c.label}: ${current}` : c.label;
      }),
      filters.customOnly ? "Custom Only: ON" : "Custom Only",
      "Clear Filters",
      "Cancel",
    ];

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: sheetOptions,
        cancelButtonIndex: sheetOptions.length - 1,
        destructiveButtonIndex: sheetOptions.length - 2,
        title: "Filter Exercises",
      },
      (index) => {
        if (index < categories.length) {
          openCategorySheet(categories[index]);
        } else if (index === categories.length) {
          onFiltersChange({ ...filters, customOnly: !filters.customOnly });
        } else if (index === categories.length + 1) {
          onFiltersChange({ q: filters.q, bodyPart: undefined, equipment: undefined, target: undefined, customOnly: undefined });
        }
      }
    );
  };

  const openCategorySheet = (category: { label: string; key: "bodyPart" | "equipment" | "target"; options: string[] }) => {
    const options = ["All", ...category.options, "Cancel"];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
        title: `Filter by ${category.label}`,
      },
      (index) => {
        if (index === 0) {
          onFiltersChange({ ...filters, [category.key]: undefined });
        } else if (index < options.length - 1) {
          onFiltersChange({ ...filters, [category.key]: category.options[index - 1] });
        }
      }
    );
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, gap: 10 }}>
      <View style={{ flex: 1 }}>
        <SearchBar
          value={filters.q}
          onChangeText={(q) => onFiltersChange({ ...filters, q })}
          placeholder="Search exercises..."
        />
      </View>
      <Pressable
        onPress={openFilterSheet}
        accessibilityRole="button"
        accessibilityLabel={activeCount > 0 ? `Filters active, ${activeCount} selected` : "Open filters"}
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: activeCount > 0
            ? PROGRESS_COLORS.positive.background
            : PROGRESS_COLORS.cardBackground,
          borderWidth: 1,
          borderColor: activeCount > 0
            ? PROGRESS_COLORS.positive.primary + "60"
            : PROGRESS_COLORS.tertiaryText + "40",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SlidersHorizontal
          size={20}
          color={activeCount > 0 ? PROGRESS_COLORS.positive.primary : PROGRESS_COLORS.secondaryText}
        />
        {activeCount > 0 && (
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: PROGRESS_COLORS.positive.primary,
            }}
          />
        )}
      </Pressable>
    </View>
  );
}
