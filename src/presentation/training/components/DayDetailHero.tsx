/**
 * DayDetailHero — the metadata card atop "Detalle de día": a type eyebrow + the
 * routine/day context, the type bubble with the day name and "dow · focus", and a
 * 4-stat row (exercises, sets, estimate, estimated volume). Mirrors the handoff's
 * `DdHero`.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Repeat, Layers, Clock, Zap } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { DAY_TYPE } from "../lib/dayType";
import type { DayDetailHeader } from "@/domain/training/models/DayDetailView";

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 3 }}>
      {icon}
      <Text style={{ fontFamily: sans(700), fontSize: 15, color: glass.white }}>
        {value}
      </Text>
      <Text
        style={{
          fontFamily: mono(400),
          fontSize: 9.5,
          color: glass.ink3,
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function DayDetailHero({ header }: { header: DayDetailHeader }) {
  const { t } = useTranslation();
  const cfg = DAY_TYPE[header.type];

  return (
    <GlassSurface radius={24} style={{ padding: 18, gap: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontFamily: mono(600),
            fontSize: 10,
            letterSpacing: 1.2,
            color: cfg.color,
            textTransform: "uppercase",
          }}
        >
          {t(`training.dayType.${header.type}`)}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Repeat size={12} color={glass.ink3} strokeWidth={2} />
          <Text
            style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}
          >
            {t("training.dayDetail.context", {
              routine: header.routineName,
              day: header.dayNumber,
              total: header.trainingTotal,
            })}
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
            {header.dayOfWeek} · {header.focus}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", paddingTop: 2 }}>
        <Stat
          icon={<Layers size={14} color={glass.ink2} strokeWidth={2} />}
          value={String(header.exercisesCount)}
          label={t("training.dayDetail.exercisesUnit")}
        />
        <Stat
          icon={<Repeat size={14} color={glass.ink2} strokeWidth={2} />}
          value={String(header.setsCount)}
          label={t("training.dayDetail.setsUnit")}
        />
        <Stat
          icon={<Clock size={14} color={glass.ink2} strokeWidth={2} />}
          value={`~${header.estimateMin}`}
          label={t("training.dayDetail.minUnit")}
        />
        <Stat
          icon={<Zap size={14} color={glass.ink2} strokeWidth={2} />}
          value={header.volumeEstimate}
          label={t("training.dayDetail.volEstUnit")}
        />
      </View>
    </GlassSurface>
  );
}
