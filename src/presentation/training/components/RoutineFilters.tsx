import { View, Pressable, ActionSheetIOS, Platform } from "react-native";
import { SlidersHorizontal } from "lucide-react-native";
import { SearchBar } from "@/presentation/_shared/components/SearchBar";
import { PROGRESS_COLORS } from "@/presentation/_shared/constants/progress-colors";

export type RoutineStatusFilter = "all" | "active" | "completed" | "inactive";

const FILTER_OPTIONS: { key: RoutineStatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "inactive", label: "Inactive" },
];

interface RoutineFiltersProps {
  search: string;
  onSearchChange: (text: string) => void;
  statusFilter: RoutineStatusFilter;
  onStatusFilterChange: (filter: RoutineStatusFilter) => void;
}

export function RoutineFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: RoutineFiltersProps) {
  const hasActiveFilter = statusFilter !== "all";

  const openFilterSheet = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...FILTER_OPTIONS.map((o) => o.label), "Cancel"],
          cancelButtonIndex: FILTER_OPTIONS.length,
          title: "Filter by status",
        },
        (index) => {
          if (index < FILTER_OPTIONS.length) {
            onStatusFilterChange(FILTER_OPTIONS[index].key);
          }
        }
      );
    }
  };

  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, gap: 10 }}>
      <View style={{ flex: 1 }}>
        <SearchBar
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search routines..."
        />
      </View>
      <Pressable
        onPress={openFilterSheet}
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: hasActiveFilter
            ? PROGRESS_COLORS.positive.background
            : PROGRESS_COLORS.cardBackground,
          borderWidth: 1,
          borderColor: hasActiveFilter
            ? PROGRESS_COLORS.positive.primary + "60"
            : PROGRESS_COLORS.tertiaryText + "40",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SlidersHorizontal
          size={20}
          color={hasActiveFilter ? PROGRESS_COLORS.positive.primary : PROGRESS_COLORS.secondaryText}
        />
        {hasActiveFilter && (
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
