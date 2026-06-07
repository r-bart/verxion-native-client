/**
 * ProgramCouplingRow — the program's signature trait on the library card: a link
 * icon + a chip for the coupled routine and a chip for the coupled diet. Missing
 * sides render a dashed "Sin rutina/dieta" chip. Names only — taps happen on the
 * whole card. Mirrors the handoff `PgCoupleRow`.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Link2, Dumbbell, Utensils } from "lucide-react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import type { ProgramOverview } from "@/domain/program/models/Program";

function CoupleChip({
  kind,
  label,
}: {
  kind: "routine" | "diet";
  label: string | null;
}) {
  const Icon = kind === "diet" ? Utensils : Dumbbell;
  const empty = !label;
  const { t } = useTranslation();
  const text = label ?? t(empty && kind === "diet" ? "program.couple.noDiet" : "program.couple.noRoutine");
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 9999,
        backgroundColor: empty ? "transparent" : glass.fill2,
        borderWidth: 1,
        borderColor: glass.stroke,
        borderStyle: empty ? "dashed" : "solid",
        flexShrink: 1,
      }}
    >
      <Icon size={11} color={empty ? glass.ink3 : glass.ink2} strokeWidth={2} />
      <Text
        numberOfLines={1}
        style={{ fontFamily: sans(500), fontSize: 11.5, color: empty ? glass.ink3 : glass.ink2, flexShrink: 1 }}
      >
        {text}
      </Text>
    </View>
  );
}

export function ProgramCouplingRow({ program }: { program: ProgramOverview }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
      <Link2 size={12} color="rgba(255,255,255,0.34)" strokeWidth={2} />
      <CoupleChip kind="routine" label={program.routine?.name ?? null} />
      <CoupleChip kind="diet" label={program.dietPlan?.name ?? null} />
    </View>
  );
}
