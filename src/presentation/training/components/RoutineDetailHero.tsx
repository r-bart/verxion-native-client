/**
 * RoutineDetailHero — the metadata card atop "Detalle de rutina": state eyebrow +
 * context line, the type bubble with name and goal, a 4-stat row (days/week,
 * weeks, adherence, volume), and — on non-draft blocks — the week progress with
 * score and cells. Mirrors the handoff's `RtHero`.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import {
  Target,
  Calendar,
  Layers,
  CheckCheck,
  Zap,
  Sparkles,
  Pause,
} from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { Chip } from "@/presentation/_shared/components/Chip";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import { DAY_TYPE } from "../lib/dayType";
import { ScoreChip } from "./ScoreChip";
import type { RoutineDetailHeader } from "@/domain/training/models/RoutineDetailView";
import type { RoutineLibraryState } from "@/domain/training/models/RoutineLibrary";

const STATE_COLOR: Record<RoutineLibraryState, string> = {
  active: glass.lava,
  draft: palette.insight.text,
  paused: palette.neutral.text,
  completed: glass.up,
};

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

export function RoutineDetailHero({ header }: { header: RoutineDetailHeader }) {
  const { t } = useTranslation();
  const cfg = DAY_TYPE[header.type];
  const color = STATE_COLOR[header.state];
  const isDraft = header.state === "draft";
  const isCompleted = header.state === "completed";
  const partial =
    header.weekFraction != null &&
    header.weekFraction > 0 &&
    header.weekFraction < 1
      ? header.weekFraction
      : null;

  return (
    <GlassSurface radius={24} style={{ padding: 18, gap: 16 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {header.state === "active" && (
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: color,
              }}
            />
          )}
          {isDraft && <Sparkles size={11} color={color} strokeWidth={2.2} />}
          {header.state === "paused" && (
            <Pause size={11} color={color} strokeWidth={2.2} />
          )}
          <Text
            style={{
              fontFamily: mono(600),
              fontSize: 10,
              letterSpacing: 1,
              color,
              textTransform: "uppercase",
            }}
          >
            {t(`training.routineLibrary.stateEyebrow.${header.state}`)}
          </Text>
        </View>
        <Text
          style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}
        >
          {header.contextLabel}
        </Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
        <IconBubble bg={cfg.bg} size={52}>
          <cfg.Icon size={26} color={cfg.color} strokeWidth={2} />
        </IconBubble>
        <View style={{ flex: 1, gap: 7 }}>
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
          <View style={{ flexDirection: "row" }}>
            <Chip
              tone="lava"
              icon={<Target size={11} color={glass.lava} strokeWidth={2.2} />}
              label={header.goal}
            />
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", paddingTop: 2 }}>
        <Stat
          icon={<Calendar size={14} color={glass.ink2} strokeWidth={2} />}
          value={String(header.perWeek)}
          label={t("training.routineDetail.perWeekUnit")}
        />
        <Stat
          icon={<Layers size={14} color={glass.ink2} strokeWidth={2} />}
          value={String(header.weeks)}
          label={t("training.routineDetail.weeksUnit")}
        />
        {isDraft ? (
          <Stat
            icon={<Zap size={14} color={glass.ink2} strokeWidth={2} />}
            value={String(header.sessionsPlanned)}
            label={t("training.routineDetail.sessionsUnit")}
          />
        ) : (
          <Stat
            icon={<CheckCheck size={14} color={glass.ink2} strokeWidth={2} />}
            value={`${header.adherencePct}%`}
            label={t("training.routineDetail.adherenceUnit")}
          />
        )}
        <Stat
          icon={<Zap size={14} color={glass.ink2} strokeWidth={2} />}
          value={header.volumeTotal}
          label={t("training.routineDetail.volumeUnit")}
        />
      </View>

      {!isDraft && (
        <View
          style={{
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: glass.stroke,
            paddingTop: 14,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{ fontFamily: mono(500), fontSize: 12, color: glass.ink2 }}
            >
              {isCompleted
                ? t("training.routineLibrary.completedWeeks", {
                    weeks: header.weeks,
                  })
                : t("training.routine.week", {
                    week: header.week,
                    weeks: header.weeks,
                  })}
            </Text>
            {!isCompleted && <ScoreChip state={header.scoreState} />}
          </View>

          <View style={{ flexDirection: "row", gap: 4 }}>
            {Array.from({ length: header.weeks }).map((_, i) => {
              const done = isCompleted || i < header.week - 1;
              const now = !isCompleted && i === header.week - 1;
              return (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 5,
                    borderRadius: 9999,
                    overflow: "hidden",
                    backgroundColor: done
                      ? glass.lava
                      : "rgba(255,255,255,0.10)",
                  }}
                >
                  {now && partial != null && (
                    <View
                      style={{
                        height: "100%",
                        width: `${Math.max(9, partial * 100)}%`,
                        backgroundColor: glass.lava,
                      }}
                    />
                  )}
                  {now && partial == null && (
                    <View
                      style={{
                        height: "100%",
                        width: "100%",
                        backgroundColor: glass.lava,
                        opacity: 0.5,
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>

          <Text
            style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}
          >
            {t("training.routineDetail.progressMeta", {
              done: header.sessionsDone,
              planned: header.sessionsPlanned,
            })}{" "}
            ·{" "}
            <Text style={{ color: glass.up }}>
              {t("training.routineLibrary.volTrend", {
                pct: header.volumeTrendPct,
              })}
            </Text>
          </Text>
        </View>
      )}
    </GlassSurface>
  );
}
