/**
 * ActivePlan — the "qué sigo" slot on "Hoy" (handoff `design_handoff_programas`
 * §A). Polymorphic: it paints what the user actually has, derived from the
 * server's `setup` discriminator, not from a fixed three-row list.
 *
 * - **programa** — an active program is the umbrella, so it collapses the routine
 *   + diet into a single program row (their names ride the subtitle). Showing all
 *   three would be redundant; the breakdown lives in the program detail.
 * - **rutina / dieta** — a single standalone plan of that kind.
 * - **sueltas** — an active routine AND diet not bundled under a program: two
 *   rows + a hint that bundling is an agent request (read-only client).
 * - **nada** — no active plan (cold-start is handled upstream by
 *   `TodayEmptyState`; this covers a populated day with nothing active).
 *
 * Returns flat siblings (Divider + blocks) so the `TodayScreen` ScrollView gap
 * spaces them, matching the rest of the day's sections. Read-only; tap-through to
 * the program/routine/diet detail lands with the `program` module.
 */
import { Fragment } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter, type Href } from "expo-router";
import { Dumbbell, Utensils, CalendarRange } from "lucide-react-native";
import type {
  RoutineProgress,
  DietProgress,
  ProgramProgress,
  TodaySetup,
} from "@/domain/today/models/TodayDashboard";
import { glass } from "@/presentation/_shared/design/glass";
import { sans } from "@/presentation/_shared/design/fonts";
import { FRONT_VISUALS } from "../lib/fronts";
import { PlanRow } from "./PlanRow";
import { SectionLabel } from "./SectionLabel";

function Divider() {
  return <View style={{ height: 1, backgroundColor: glass.stroke }} />;
}

function Hint({ children }: { children: string }) {
  return (
    <Text style={{ fontFamily: sans(500), fontSize: 12, color: glass.ink3, letterSpacing: -0.12 }}>
      {children}
    </Text>
  );
}

export function ActivePlan({
  setup,
  routine,
  diet,
  program,
}: {
  setup: TodaySetup;
  routine: RoutineProgress | null;
  diet: DietProgress | null;
  program: ProgramProgress | null;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const go = (path: Href) => () => router.push(path);
  const week = (w: number, total: number) => t("today.planWeek", { week: w, total });

  const programActive = setup.program === "active" && !!program;
  const routineActive = setup.routine === "active" && !!routine;
  const dietActive = setup.dietPlan === "active" && !!diet;

  // ── PROGRAMA — the umbrella collapses routine + diet into one row ──────────
  if (programActive && program) {
    const subtitle = [routine?.name, diet?.name].filter(Boolean).join(" · ") || null;
    return (
      <>
        <Divider />
        <PlanRow
          label={`${t("today.plans.programActive")} · ${week(program.week, program.totalWeeks)}`}
          name={program.name}
          subtitle={subtitle}
          Icon={CalendarRange}
          // Neutral/white: the macro-plan "umbrella", distinct from the domain colors.
          iconColor={glass.ink}
          adherenceScore={program.adherenceScore}
          adherenceMax={program.adherenceMax}
          onPress={go("/programas/activo" as Href)}
        />
      </>
    );
  }

  // ── otherwise: standalone routine and/or diet rows ────────────────────────
  const rows: React.ReactNode[] = [];
  if (routineActive && routine) {
    // Periodized → block name in the eyebrow + "Bloque x/y · Sem w/t" sub; flat
    // (mesocycle null) → the plain "RUTINA · SEMANA x/y" eyebrow, no sub.
    const block = routine.mesocycle;
    rows.push(
      <PlanRow
        key="routine"
        label={
          block
            ? `${t("today.plans.routine")} · ${block.name.toUpperCase()}`
            : `${t("today.plans.routine")} · ${week(routine.week, routine.totalWeeks)}`
        }
        name={routine.name}
        subtitle={
          block
            ? t("today.planBlockSub", {
                index: block.orderIndex + 1,
                total: block.totalBlocks,
                week: routine.week,
                weeks: routine.totalWeeks,
              })
            : null
        }
        Icon={Dumbbell}
        iconColor={glass.lava}
        adherenceScore={routine.adherenceScore}
        adherenceMax={routine.adherenceMax}
        onPress={go("/workout" as Href)}
      />,
    );
  }
  if (dietActive && diet) {
    rows.push(
      <PlanRow
        key="diet"
        label={
          diet.phase
            ? `${t("today.plans.diet")} · ${diet.phase.toUpperCase()}`
            : t("today.plans.diet")
        }
        name={diet.name}
        Icon={Utensils}
        // Nutrition's coral — same identity as the nutrition front.
        iconColor={FRONT_VISUALS.nutrition.color}
        adherenceScore={diet.adherenceScore}
        adherenceMax={diet.adherenceMax}
        onPress={go("/nutrition" as Href)}
      />,
    );
  }

  // ── NADA — no active plan (cold-start handled upstream by TodayEmptyState) ──
  if (rows.length === 0) {
    return (
      <>
        <Divider />
        <View style={{ gap: 6 }}>
          <SectionLabel>{t("today.plans.yourPlan")}</SectionLabel>
          <Hint>{t("today.plans.none")}</Hint>
        </View>
      </>
    );
  }

  // ── SUELTAS (routine + diet, unbundled) or a single standalone row ─────────
  const loose = rows.length === 2;
  return (
    <>
      {rows.map((row, i) => (
        <Fragment key={i}>
          <Divider />
          {row}
        </Fragment>
      ))}
      {loose ? <Hint>{t("today.plans.looseHint")}</Hint> : null}
    </>
  );
}
