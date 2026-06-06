/**
 * SessionRecapRow — one row of the Sesiones feed: a date label (day · month)
 * heads the card, then the day-type bubble (sole left anchor), the name (+ PR
 * badge) over a volume bar, and the tonnage with its duration. Taps through to
 * the session report.
 */
import { View, Text, Pressable } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { dayKindChip } from "../lib/dayType";
import {
  fmtFeedDay,
  fmtFeedMonth,
  fmtTonnes,
  fmtMinutes,
} from "../lib/sessionFormat";
import type { SessionFeedRow } from "@/domain/training/models/SessionFeed";

function PRBadge({ count }: { count: number }) {
  return (
    <View
      style={{
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 9999,
        backgroundColor: palette.neutral.background,
        borderWidth: 1,
        borderColor: "rgba(255,185,0,0.3)",
      }}
    >
      <Text
        style={{
          fontFamily: mono(700),
          fontSize: 9,
          letterSpacing: 0.4,
          color: palette.neutral.text,
        }}
      >
        {count > 1 ? `${count} PR` : "PR"}
      </Text>
    </View>
  );
}

export function SessionRecapRow({ row }: { row: SessionFeedRow }) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const cfg = dayKindChip(row.type);
  const durationLabel =
    row.durationSeconds != null ? `${fmtMinutes(row.durationSeconds)}m` : "—";

  return (
    <Pressable
      onPress={() => router.push(`/workout/sesiones/${row.id}` as Href)}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface radius={16} style={{ padding: 12, gap: 9 }}>
        <Text
          style={{
            fontFamily: mono(600),
            fontSize: 9.5,
            letterSpacing: 0.9,
            color: glass.ink3,
            textTransform: "uppercase",
          }}
        >
          {fmtFeedDay(locale, row.completedAt)} ·{" "}
          {fmtFeedMonth(locale, row.completedAt)}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
          <IconBubble bg={cfg.bg} size={36}>
            <cfg.Icon size={18} color={cfg.color} strokeWidth={2} />
          </IconBubble>

          <View style={{ flex: 1, gap: 6 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 7 }}
            >
              <Text
                style={{
                  fontFamily: sans(600),
                  fontSize: 14,
                  color: glass.white,
                }}
              >
                {row.name}
              </Text>
              {row.hasPR && <PRBadge count={row.prCount} />}
            </View>
            <View
              style={{
                height: 4,
                borderRadius: 9999,
                backgroundColor: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${Math.round(row.volumeFraction * 100)}%`,
                  backgroundColor: glass.lava,
                  borderRadius: 9999,
                }}
              />
            </View>
          </View>

          <View style={{ alignItems: "flex-end", gap: 3 }}>
            <Text
              style={{
                fontFamily: sans(700),
                fontSize: 13,
                color: glass.white,
                letterSpacing: -0.2,
              }}
            >
              {fmtTonnes(locale, row.volume.value)} t
            </Text>
            <Text
              style={{
                fontFamily: mono(500),
                fontSize: 10.5,
                color: glass.ink3,
              }}
            >
              {durationLabel}
            </Text>
          </View>
        </View>
      </GlassSurface>
    </Pressable>
  );
}
