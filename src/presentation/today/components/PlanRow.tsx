/**
 * PlanRow — one active plan in the "Hoy" plans section. Generalizes the handoff's
 * routine row (`01-Hoy`: mono section label · domain-colored icon · name · green
 * adherence chip) to any plan kind (routine / diet / program). The adherence
 * chip hides when the score is null (cold-start), like the original routine row.
 */
import { View, Text, Pressable } from "react-native";
import type { ComponentType } from "react";
import { TrendingUp, ChevronRight, type LucideProps } from "lucide-react-native";
import { Chip } from "@/presentation/_shared/components/Chip";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { SectionLabel } from "./SectionLabel";

export function PlanRow({
  label,
  name,
  subtitle,
  Icon,
  iconColor,
  adherenceScore,
  adherenceMax,
  onPress,
}: {
  /** Full mono label, e.g. "RUTINA · SEMANA 3 / 6" or "DIETA · DÉFICIT". */
  label: string;
  name: string;
  /** Optional secondary line under the name (e.g. a program's coupled "PPL · Definición"). */
  subtitle?: string | null;
  Icon: ComponentType<LucideProps>;
  iconColor: string;
  adherenceScore: number | null;
  adherenceMax: number;
  /** When set, the row is tappable (navigates to the plan's detail) and shows a chevron. */
  onPress?: () => void;
}) {
  const inner = (
    <View style={{ gap: 12 }}>
      <SectionLabel>{label}</SectionLabel>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Icon size={18} color={iconColor} strokeWidth={2} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{ fontFamily: sans(700), fontSize: 16, color: glass.white, letterSpacing: -0.32 }}
            numberOfLines={1}
          >
            {name}
          </Text>
          {subtitle ? (
            <Text
              style={{ fontFamily: sans(500), fontSize: 13, color: glass.ink2, letterSpacing: -0.13 }}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {adherenceScore != null && (
          <Chip
            tone="up"
            icon={<TrendingUp size={12} color={glass.up} strokeWidth={2.5} />}
            label={`${adherenceScore} /${adherenceMax}`}
          />
        )}
        {onPress && <ChevronRight size={16} color="rgba(255,255,255,0.28)" strokeWidth={2} />}
      </View>
    </View>
  );

  if (!onPress) return inner;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      {inner}
    </Pressable>
  );
}
