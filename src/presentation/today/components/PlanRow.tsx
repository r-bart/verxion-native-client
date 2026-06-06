/**
 * PlanRow — one active plan in the "Hoy" plans section. Generalizes the handoff's
 * routine row (`01-Hoy`: mono section label · domain-colored icon · name · green
 * adherence chip) to any plan kind (routine / diet / program). The adherence
 * chip hides when the score is null (cold-start), like the original routine row.
 */
import { View, Text } from "react-native";
import type { ComponentType } from "react";
import { TrendingUp, type LucideProps } from "lucide-react-native";
import { Chip } from "@/presentation/_shared/components/Chip";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { SectionLabel } from "./SectionLabel";

export function PlanRow({
  label,
  name,
  Icon,
  iconColor,
  adherenceScore,
  adherenceMax,
}: {
  /** Full mono label, e.g. "RUTINA · SEMANA 3 / 6" or "DIETA · DÉFICIT". */
  label: string;
  name: string;
  Icon: ComponentType<LucideProps>;
  iconColor: string;
  adherenceScore: number | null;
  adherenceMax: number;
}) {
  return (
    <View style={{ gap: 12 }}>
      <SectionLabel>{label}</SectionLabel>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Icon size={18} color={iconColor} strokeWidth={2} />
        <Text
          style={{ flex: 1, fontFamily: sans(700), fontSize: 16, color: glass.white, letterSpacing: -0.32 }}
          numberOfLines={1}
        >
          {name}
        </Text>
        {adherenceScore != null && (
          <Chip
            tone="up"
            icon={<TrendingUp size={12} color={glass.up} strokeWidth={2.5} />}
            label={`${adherenceScore} /${adherenceMax}`}
          />
        )}
      </View>
    </View>
  );
}
