/**
 * ProgramAdherenceCard — the unified-adherence block on the program detail: the
 * Skia ring with the unified score, a pace chip, the phase + confidence pills,
 * a phase hint, and the two sub-bars (training lava · diet cyan). A program with
 * no diet shows the diet bar as "—". Hidden entirely when there's no adherence
 * data (drafts). Mirrors the handoff `PgdAdherence`.
 */
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Dumbbell, Utensils, TrendingUp, ShieldCheck } from "lucide-react-native";
import { GlassSurface } from "@/presentation/_shared/components/GlassSurface";
import { Ring } from "@/presentation/_shared/components/Ring";
import { Chip } from "@/presentation/_shared/components/Chip";
import { glass } from "@/presentation/_shared/design/glass";
import { palette } from "@/presentation/_shared/design/tokens";
import { sans, mono } from "@/presentation/_shared/design/fonts";
import type { ProgramAdherence } from "@/domain/program/models/ProgramAdherence";
import type { PaceState } from "@/domain/program/models/Program";
import { paceChipTone } from "../lib/programStatus";

function ringColor(state: PaceState | null): string {
  if (state === "ahead") return glass.up;
  if (state === "behind") return palette.health.text;
  return palette.neutral.text;
}

function SubBar({
  icon,
  label,
  score,
  color,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  score: number | null;
  color: string;
  sub: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {icon}
          <Text style={{ fontFamily: sans(600), fontSize: 12.5, color }}>{label}</Text>
        </View>
        <Text style={{ fontFamily: mono(500), fontSize: 12.5, color: glass.ink }}>
          {score == null ? "—" : `${score}%`}
        </Text>
      </View>
      <View style={{ height: 6, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.10)", overflow: "hidden" }}>
        <View style={{ height: "100%", width: `${Math.max(0, Math.min(100, score ?? 0))}%`, backgroundColor: color }} />
      </View>
      <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>{sub}</Text>
    </View>
  );
}

export function ProgramAdherenceCard({
  adherence,
  paceState = null,
}: {
  adherence: ProgramAdherence;
  /** Pace state from the program overview (`PaceClassifier`); the adherence read
   *  itself carries phase + confidence, not pace. Falls back to a score band. */
  paceState?: PaceState | null;
}) {
  const { t } = useTranslation();
  const score = adherence.unifiedExecutionScore;
  const inferred: PaceState | null =
    score == null ? null : score >= 85 ? "ahead" : score >= 60 ? "on" : "behind";
  const state = paceState ?? inferred;
  const color = ringColor(state);
  const phase = adherence.programContext?.phase;
  const hasDiet = adherence.diet?.available ?? false;

  return (
    <GlassSurface radius={20} style={{ padding: 16, gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Ring size={86} stroke={7} progress={(score ?? 0) / 100} color={color}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: sans(700), fontSize: 22, color: glass.white, letterSpacing: -0.5 }}>
              {score ?? "—"}
            </Text>
            <Text style={{ fontFamily: mono(400), fontSize: 10, color: glass.ink3 }}>/ 100</Text>
          </View>
        </Ring>

        <View style={{ flex: 1, gap: 7 }}>
          <Text style={{ fontFamily: mono(600), fontSize: 10, letterSpacing: 0.8, color: glass.ink3, textTransform: "uppercase" }}>
            {t("program.detail.adherenceTitle")}
          </Text>
          {state && (
            <View style={{ flexDirection: "row" }}>
              <Chip
                tone={paceChipTone(state)}
                icon={state === "ahead" ? <TrendingUp size={11} color={glass.up} strokeWidth={2.5} /> : undefined}
                label={t(`program.pace.${state}`)}
              />
            </View>
          )}
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
            {phase && (
              <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: glass.fill2, borderWidth: 1, borderColor: glass.stroke }}>
                <Text style={{ fontFamily: sans(500), fontSize: 11, color: glass.ink2 }}>{t(`program.detail.phase.${phase}`)}</Text>
              </View>
            )}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: glass.fill, borderWidth: 1, borderColor: glass.stroke }}>
              <ShieldCheck size={10} color={glass.ink3} strokeWidth={2} />
              <Text style={{ fontFamily: sans(500), fontSize: 11, color: glass.ink3 }}>{t(`program.detail.confidence.${adherence.confidence}`)}</Text>
            </View>
          </View>
        </View>
      </View>

      {phase && (
        <Text style={{ fontFamily: mono(400), fontSize: 11.5, color: glass.ink2, lineHeight: 16 }}>
          {t(`program.detail.phaseHint.${phase}`)}
        </Text>
      )}

      <View style={{ gap: 13 }}>
        <SubBar
          icon={<Dumbbell size={12} color={glass.lava} strokeWidth={2} />}
          label={t("program.detail.train")}
          score={adherence.training?.executionScore ?? null}
          color={glass.lava}
          sub={t("program.detail.sessions", {
            done: adherence.training?.sessionsCompleted ?? 0,
            total: adherence.training?.sessionsExpected ?? 0,
          })}
        />
        {hasDiet && adherence.diet ? (
          <SubBar
            icon={<Utensils size={12} color={palette.body.text} strokeWidth={2} />}
            label={t("program.detail.diet")}
            score={adherence.diet.executionScore}
            color={palette.body.text}
            sub={t("program.detail.days", { done: adherence.diet.daysTracked, total: adherence.diet.daysExpected })}
          />
        ) : (
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Utensils size={12} color={glass.ink3} strokeWidth={2} />
                <Text style={{ fontFamily: sans(600), fontSize: 12.5, color: glass.ink3 }}>{t("program.detail.diet")}</Text>
              </View>
              <Text style={{ fontFamily: mono(500), fontSize: 12.5, color: glass.ink3 }}>—</Text>
            </View>
            <Text style={{ fontFamily: mono(400), fontSize: 11, color: glass.ink3 }}>{t("program.detail.noDietBar")}</Text>
          </View>
        )}
      </View>
    </GlassSurface>
  );
}
