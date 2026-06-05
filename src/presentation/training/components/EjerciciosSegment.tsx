/**
 * EjerciciosSegment — the Entreno landing's "Ejercicios" segment: the exercise
 * library as a searchable, filterable feed. Search + group/equipment filters +
 * sort run client-side over one library read (useExerciseLibraryView); filters
 * live in bottom sheets with removable active chips. Owns its own scroll.
 */
import { useState } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { BottomSheet } from "@/presentation/_shared/components/BottomSheet";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { useExerciseLibrary } from "../hooks/useExerciseLibrary";
import { useExerciseLibraryView, type ExerciseSort } from "../hooks/useExerciseLibraryView";
import { ExerciseLibraryRow } from "./ExerciseLibraryRow";
import { SheetOption } from "./SheetOption";
import { SegmentError } from "./SegmentError";

const SORTS: ExerciseSort[] = ["name", "logged"];

function PillButton({ icon, label, onPress }: { icon: React.ReactNode; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ flex: 1, opacity: pressed ? glass.pressOpacity : 1 })}>
      <GlassSurface radius={9999} style={{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 11 }}>
        {icon}
        <Text style={{ fontFamily: sans(600), fontSize: 13, color: glass.white }}>{label}</Text>
      </GlassSurface>
    </Pressable>
  );
}

function RemovableChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Pressable onPress={onRemove} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingLeft: 11, paddingRight: 8, paddingVertical: 6, borderRadius: 9999, backgroundColor: glass.lavaBg, borderWidth: 1, borderColor: glass.lavaBorder }}>
        <Text style={{ fontFamily: sans(600), fontSize: 12, color: glass.lava }}>{label}</Text>
        <X size={13} color={glass.lava} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

export function EjerciciosSegment() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useExerciseLibrary();
  const view = useExerciseLibraryView(data);
  const [sheet, setSheet] = useState<"filter" | "sort" | null>(null);

  if (isLoading) {
    return (
      <View style={{ paddingHorizontal: 16, gap: 8, paddingTop: 8 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <GlassSurface key={i} radius={16} style={{ height: 62 }} />
        ))}
      </View>
    );
  }
  if (isError || !data) {
    return <View style={{ paddingHorizontal: 16 }}><SegmentError onRetry={() => refetch()} /></View>;
  }

  const Header = (
    <View style={{ gap: 12, paddingBottom: 6 }}>
      <GlassSurface radius={14} style={{ flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 14, height: 44 }}>
        <Search size={17} color={glass.ink3} strokeWidth={2} />
        <TextInput
          value={view.query}
          onChangeText={view.setQuery}
          placeholder={t("training.exerciseLibrary.search")}
          placeholderTextColor={glass.ink3}
          style={{ flex: 1, fontFamily: sans(500), fontSize: 14, color: glass.white }}
        />
      </GlassSurface>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <PillButton icon={<SlidersHorizontal size={15} color={glass.ink2} strokeWidth={2} />} label={t("training.exerciseLibrary.filterTitle")} onPress={() => setSheet("filter")} />
        <PillButton icon={<ArrowUpDown size={15} color={glass.ink2} strokeWidth={2} />} label={t(`training.exerciseSort.${view.sort}`)} onPress={() => setSheet("sort")} />
      </View>

      {(view.group || view.equipment) && (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {view.group && <RemovableChip label={view.group} onRemove={() => view.setGroup(null)} />}
          {view.equipment && <RemovableChip label={view.equipment} onRemove={() => view.setEquipment(null)} />}
        </View>
      )}

      <Text style={{ fontFamily: mono(500), fontSize: 11, color: glass.ink3 }}>
        {t("training.exerciseLibrary.lead", { count: view.filtered.length })}
      </Text>
    </View>
  );

  return (
    <>
      <FlatList
        data={view.filtered}
        keyExtractor={(it) => it.id}
        ListHeaderComponent={Header}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 8 }}>
            <ExerciseLibraryRow item={item} />
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ fontFamily: mono(400), fontSize: 13, color: glass.ink3, textAlign: "center", paddingTop: 24 }}>
            {t("training.exerciseLibrary.empty")}
          </Text>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <BottomSheet visible={sheet === "filter"} onClose={() => setSheet(null)} title={t("training.exerciseLibrary.filterTitle")}>
        <Text style={{ fontFamily: mono(600), fontSize: 10, letterSpacing: 0.8, color: glass.ink3, textTransform: "uppercase", marginBottom: 2 }}>
          {t("training.exerciseLibrary.groupSection")}
        </Text>
        <SheetOption label={t("training.exerciseLibrary.all")} selected={view.group === null} onPress={() => view.setGroup(null)} />
        {data.facets.groups.map((g) => (
          <SheetOption key={g} label={g} selected={view.group === g} onPress={() => view.setGroup(view.group === g ? null : g)} />
        ))}

        <Text style={{ fontFamily: mono(600), fontSize: 10, letterSpacing: 0.8, color: glass.ink3, textTransform: "uppercase", marginTop: 10, marginBottom: 2 }}>
          {t("training.exerciseLibrary.equipmentSection")}
        </Text>
        <SheetOption label={t("training.exerciseLibrary.all")} selected={view.equipment === null} onPress={() => view.setEquipment(null)} />
        {data.facets.equipment.map((e) => (
          <SheetOption key={e} label={e} selected={view.equipment === e} onPress={() => view.setEquipment(view.equipment === e ? null : e)} />
        ))}
      </BottomSheet>

      <BottomSheet visible={sheet === "sort"} onClose={() => setSheet(null)} title={t("training.exerciseLibrary.sortTitle")}>
        {SORTS.map((s) => (
          <SheetOption key={s} label={t(`training.exerciseSort.${s}`)} selected={view.sort === s} onPress={() => { view.setSort(s); setSheet(null); }} />
        ))}
      </BottomSheet>
    </>
  );
}
