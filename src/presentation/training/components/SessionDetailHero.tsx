/**
 * SessionDetailHero — the metadata card atop "Detalle de sesión": a "completed"
 * eyebrow + the routine context, the type bubble with the session name and its
 * long date, then the completion class chip ("Plan perfecto"/"Plan seguido") and
 * the percent completed. Mirrors the handoff's `SdHero`.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Star, Repeat, Layers } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { dayKindChip } from "../lib/dayType";
import { fmtSessionDate } from "../lib/sessionFormat";
import type { SessionDetailHeader } from "@/domain/training/models/SessionDetailView";

export function SessionDetailHero({ header }: { header: SessionDetailHeader }) {
  const { t, i18n } = useTranslation();
  const cfg = dayKindChip(header.type ?? "workout");

  return (
    <GlassSurface radius={24} style={{ padding: 18, gap: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Star size={11} color={cfg.color} strokeWidth={2.4} />
          <Text
            style={{
              fontFamily: mono(600),
              fontSize: 10,
              letterSpacing: 1.2,
              color: cfg.color,
              textTransform: "uppercase",
            }}
          >
            {t("training.sessionDetail.completed")}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Repeat size={12} color={glass.ink3} strokeWidth={2} />
          <Text
            style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}
            numberOfLines={1}
          >
            {header.routineName}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
        <IconBubble bg={cfg.bg} size={52}>
          <cfg.Icon size={26} color={cfg.color} strokeWidth={2} />
        </IconBubble>
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{
              fontFamily: sans(700),
              fontSize: 22,
              color: glass.white,
              letterSpacing: -0.6,
            }}
            numberOfLines={1}
          >
            {header.name}
          </Text>
          <Text
            style={{ fontFamily: mono(400), fontSize: 12, color: glass.ink2 }}
            numberOfLines={1}
          >
            {fmtSessionDate(i18n.language, header.completedAt)}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 9,
          flexWrap: "wrap",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 9999,
            backgroundColor: glass.upBg,
            borderWidth: 1,
            borderColor: "rgba(95,227,154,0.3)",
          }}
        >
          <Star size={12} color={glass.up} strokeWidth={2.4} />
          <Text
            style={{ fontFamily: sans(600), fontSize: 12, color: glass.up }}
          >
            {t(
              header.perfectPlan
                ? "training.sessionDetail.planPerfect"
                : "training.sessionDetail.planFollowed"
            )}
          </Text>
        </View>

        {/* Frozen periodization block — only when the session had one (§2c).
            RAW block name (server free text); we localize only "Sem x/y". */}
        {header.mesocycle && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 9999,
              backgroundColor: glass.insightBg,
              borderWidth: 1,
              borderColor: glass.insightBorder,
            }}
          >
            <Layers size={12} color={glass.insight} strokeWidth={2.4} />
            <Text
              style={{ fontFamily: sans(600), fontSize: 12, color: glass.insight }}
              numberOfLines={1}
            >
              {header.mesocycle.name}
              {" · "}
              {t("training.sessionDetail.mesocycleWeek", {
                week: header.mesocycle.week,
                weeks: header.mesocycle.weeks,
              })}
            </Text>
          </View>
        )}

        <Text
          style={{ fontFamily: mono(500), fontSize: 11.5, color: glass.ink2 }}
        >
          {t("training.sessionDetail.completedPct", {
            pct: header.completionPct,
          })}
        </Text>
      </View>
    </GlassSurface>
  );
}
