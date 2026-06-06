/**
 * PlansSection — the "Hoy" plans block. A user may have any combination of an
 * active routine, diet plan, and/or program; each present plan renders a row
 * (handoff `01-Hoy` language), separated by hairline dividers. The whole section
 * (including its leading divider) disappears when no plan is active, so cold-start
 * never shows an empty header. Read-only; rows may become expandable later.
 */
import { Fragment } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Dumbbell, Utensils, CalendarRange } from "lucide-react-native";
import type {
  RoutineProgress,
  DietProgress,
  ProgramProgress,
} from "@/domain/today/models/TodayDashboard";
import { glass } from "@/presentation/_shared/design/glass";
import { FRONT_VISUALS } from "../lib/fronts";
import { PlanRow } from "./PlanRow";

function Divider() {
  return <View style={{ height: 1, backgroundColor: glass.stroke }} />;
}

export function PlansSection({
  routine,
  diet,
  program,
}: {
  routine: RoutineProgress | null;
  diet: DietProgress | null;
  program: ProgramProgress | null;
}) {
  const { t } = useTranslation();

  const week = (w: number, total: number) => t("today.planWeek", { week: w, total });

  const rows: React.ReactNode[] = [];

  if (routine) {
    rows.push(
      <PlanRow
        key="routine"
        label={`${t("today.plans.routine")} · ${week(routine.week, routine.totalWeeks)}`}
        name={routine.name}
        Icon={Dumbbell}
        iconColor={glass.lava}
        adherenceScore={routine.adherenceScore}
        adherenceMax={routine.adherenceMax}
      />,
    );
  }

  if (diet) {
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
      />,
    );
  }

  if (program) {
    rows.push(
      <PlanRow
        key="program"
        label={`${t("today.plans.program")} · ${week(program.week, program.totalWeeks)}`}
        name={program.name}
        Icon={CalendarRange}
        // Neutral/white: the macro-plan "umbrella", distinct from the domain colors.
        iconColor={glass.ink}
        adherenceScore={program.adherenceScore}
        adherenceMax={program.adherenceMax}
      />,
    );
  }

  if (rows.length === 0) return null;

  // A leading divider before each plan (separates from the summary above and the
  // plans from each other). Rendered as siblings so the ScrollView's gap applies.
  return (
    <>
      {rows.map((row, i) => (
        <Fragment key={i}>
          <Divider />
          {row}
        </Fragment>
      ))}
    </>
  );
}
