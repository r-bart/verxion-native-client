/**
 * DaySummary — the top block of "Hoy". A segmented completion ring (one colored
 * arc per front, lit when the front is closed) beside the five fronts, split
 * ~50/50. Fronts drop their text label — the icon + the matching ring segment
 * color carry identity — leaving just the value.
 */
import { View, Text, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import type { DayFront, DayRing } from "@/domain/today/models/TodayDashboard";
import { SegmentedRing } from "@/presentation/_shared/components/SegmentedRing";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { FRONT_VISUALS, frontValueCompact } from "../lib/fronts";

const SCREEN_PADDING = 36; // ScrollView paddingHorizontal (18 × 2)
const RING_FRACTION = 0.5; // ~half the available width
const RING_MAX = 220;

function FrontRow({ front }: { front: DayFront }) {
  const { t, i18n } = useTranslation();
  const { Icon, color } = FRONT_VISUALS[front.key];
  // Unconfigured fronts (dash) read as "available, not set up" — dimmed.
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, opacity: front.counted ? 1 : 0.45 }}>
      <Icon size={18} color={color} strokeWidth={2} />
      <Text
        style={{ flex: 1, fontFamily: sans(700), fontSize: 15, color: glass.white, letterSpacing: -0.2 }}
        numberOfLines={1}
      >
        {frontValueCompact(front, t, i18n.language)}
      </Text>
    </View>
  );
}

export function DaySummary({ ring, fronts }: { ring: DayRing; fronts: DayFront[] }) {
  const { width } = useWindowDimensions();

  // No active fronts → no meaningful ring (a 0/0 segmented ring is just a hollow
  // circle). The cold-start path owns the all-empty screen; this guards the
  // rarer "no fronts but some logged events" shape so we never render it.
  if (fronts.length === 0) return null;

  const ringSize = Math.min(RING_MAX, Math.round((width - SCREEN_PADDING) * RING_FRACTION));
  const stroke = Math.round(ringSize * 0.12); // fat segments

  // The ring summarizes only configured fronts (one segment each); unconfigured
  // fronts still appear in the list below as a dash, but never as a segment —
  // so the segment count matches `ring.total`.
  const segments = fronts
    .filter((f) => f.counted)
    .map((f) => ({ color: FRONT_VISUALS[f.key].color, filled: f.closed }));

  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <SegmentedRing size={ringSize} stroke={stroke} segments={segments} gap={7}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ fontFamily: sans(700), fontSize: 52, color: glass.white, letterSpacing: -1.5 }}>
              {ring.completed}
            </Text>
            <Text style={{ fontFamily: mono(500), fontSize: 22, color: glass.ink3 }}>/{ring.total}</Text>
          </View>
        </SegmentedRing>

        <View style={{ flex: 1, gap: 16 }}>
          {fronts.map((f) => (
            <FrontRow key={f.key} front={f} />
          ))}
        </View>
      </View>
    </View>
  );
}
