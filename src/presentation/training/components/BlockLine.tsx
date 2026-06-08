/**
 * BlockLine — the active periodization block context for a periodized routine:
 * a Layers icon + the RAW block name + "Bloque {i+1}/{total}", with a ●●○ dot
 * indicator of the block's position. Lava accent (the active-block color on the
 * rutina/Hoy surfaces; insight purple is reserved for session/history).
 *
 * Renders nothing for a flat / finished / paused routine (`mesocycle == null`),
 * so callers can drop it in unconditionally. The week WITHIN the block is the
 * `WeekBar`'s job — this line is only the block identity/position.
 *
 * `name` is verbatim server free text (no i18n); only "Bloque x/y" is localized.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Layers } from "lucide-react-native";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { MesocycleIdentity } from "@/domain/training/models/RoutineDashboard";

// Past this many blocks the ●●○ row would squeeze the name / overflow the card,
// and the "Bloque x/y" text already carries the position — so drop the dots.
const MAX_DOTS = 8;

export function BlockLine({ mesocycle }: { mesocycle: MesocycleIdentity | null }) {
  const { t } = useTranslation();
  if (!mesocycle) return null;

  const { name, orderIndex, totalBlocks } = mesocycle;
  const showDots = totalBlocks <= MAX_DOTS;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
        <Layers size={13} color={glass.lava} strokeWidth={2.2} />
        <Text
          style={{ fontFamily: sans(600), fontSize: 13, color: glass.ink, letterSpacing: -0.2 }}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text style={{ fontFamily: mono(500), fontSize: 11.5, color: glass.ink3 }} numberOfLines={1}>
          {t("training.routine.block", { index: orderIndex + 1, total: totalBlocks })}
        </Text>
      </View>

      {/* ●●○ — totalBlocks dots, the active block (orderIndex) filled lava.
          Dropped past MAX_DOTS so a long block list can't overflow the card. */}
      {showDots && (
        <View testID="block-dots" style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {Array.from({ length: totalBlocks }).map((_, i) => (
            <View
              key={`block-dot-${i}`}
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                backgroundColor: i === orderIndex ? glass.lava : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
