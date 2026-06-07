/**
 * ProgramLibraryCard — the big card for an active / paused / draft program in the
 * library. Shows the status eyebrow + window, the goal bubble + name + goal chip,
 * the coupling row (its signature trait), and a footer: drafts show "sin empezar",
 * the rest show week progress + pace chip + week cells + the unified-adherence
 * meta. Taps through to the detail. Mirrors the handoff `ProgramCard`.
 */
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { CalendarRange, Target, TrendingUp, Pause, Sparkles } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { IconBubble } from "@/presentation/_shared/components/IconBubble";
import { Chip } from "@/presentation/_shared/components/Chip";
import { glass } from "@/presentation/_shared/design/glass";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { ProgramOverview } from "@/domain/program/models/Program";
import { programGoalVisual } from "../lib/programGoalVisual";
import { programStatusColor, paceChipTone } from "../lib/programStatus";
import { ProgramWeekCells } from "./ProgramWeekCells";
import { ProgramCouplingRow } from "./ProgramCouplingRow";

export function ProgramLibraryCard({ program }: { program: ProgramOverview }) {
  const { t } = useTranslation();
  const router = useRouter();
  const cfg = programGoalVisual(program.goal);
  const statusColor = programStatusColor(program.status);
  const isDraft = program.status === "draft";
  const goalLabel = program.goal ? t(`program.goals.${program.goal}`) : null;
  const windowShort =
    program.durationType === "indefinite" || program.totalWeeks <= 0
      ? t("program.windowIndefinite")
      : t("program.windowShort", { weeks: program.totalWeeks });

  return (
    <Pressable
      onPress={() => router.push(`/programas/${program.id}` as Href)}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? glass.pressOpacity : 1 })}
    >
      <GlassSurface radius={20} style={{ padding: 16, gap: 13 }}>
        {/* top: status eyebrow + window */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {program.status === "active" && (
              <View style={{ width: 7, height: 7, borderRadius: 9999, backgroundColor: statusColor }} />
            )}
            {program.status === "paused" && <Pause size={11} color={statusColor} strokeWidth={2.4} />}
            {isDraft && <Sparkles size={11} color={statusColor} strokeWidth={2} />}
            <Text style={{ fontFamily: mono(600), fontSize: 10, letterSpacing: 0.8, color: statusColor, textTransform: "uppercase" }}>
              {t(`program.status.${program.status}`)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <CalendarRange size={11} color={glass.ink3} strokeWidth={2} />
            <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>{windowShort}</Text>
          </View>
        </View>

        {/* goal bubble + name + goal chip */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <IconBubble bg={cfg.bg} size={46} radius={14}>
            <cfg.Icon size={23} color={cfg.color} strokeWidth={2} />
          </IconBubble>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ fontFamily: sans(700), fontSize: 18, color: glass.white, letterSpacing: -0.4 }} numberOfLines={2}>
              {program.name}
            </Text>
            {goalLabel && (
              <View style={{ flexDirection: "row" }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    paddingHorizontal: 9,
                    paddingVertical: 4,
                    borderRadius: 9999,
                    backgroundColor: cfg.bg,
                    borderWidth: 1,
                    borderColor: cfg.color + "55",
                  }}
                >
                  <Target size={11} color={cfg.color} strokeWidth={2} />
                  <Text style={{ fontFamily: sans(600), fontSize: 11.5, color: cfg.color }}>{goalLabel}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <ProgramCouplingRow program={program} />

        {/* footer */}
        {isDraft ? (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2 }} numberOfLines={1}>
              {t("program.draftNotStarted", { weeks: program.totalWeeks })}
            </Text>
            <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: statusColor }}>
              {t("program.viewPlan")}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 9 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2 }}>
                {program.totalWeeks > 0
                  ? t("program.weekOf", { week: program.week, total: program.totalWeeks })
                  : t("program.weekN", { week: program.week })}
              </Text>
              {program.adherenceState && (
                <Chip
                  tone={paceChipTone(program.adherenceState)}
                  icon={program.adherenceState === "ahead" ? <TrendingUp size={11} color={glass.up} strokeWidth={2.5} /> : undefined}
                  label={t(`program.pace.${program.adherenceState}`)}
                />
              )}
            </View>
            <ProgramWeekCells program={program} />
            {(program.routine?.adherenceScore != null ||
              program.dietPlan != null ||
              program.unifiedExecutionScore != null) && (
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }} numberOfLines={1}>
                  {[
                    program.routine?.adherenceScore != null
                      ? t("program.metaTrain", { pct: program.routine.adherenceScore })
                      : null,
                    program.dietPlan?.adherenceScore != null
                      ? t("program.metaDiet", { pct: program.dietPlan.adherenceScore })
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
                {program.unifiedExecutionScore != null && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <TrendingUp size={11} color={glass.up} strokeWidth={2.5} />
                    <Text style={{ fontFamily: mono(500), fontSize: 11, color: glass.up }}>
                      {t("program.metaUnified", { score: program.unifiedExecutionScore })}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </GlassSurface>
    </Pressable>
  );
}
