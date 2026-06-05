/**
 * DayDetailView — the "Detalle de día" aggregate (`dia/[id]`): a workout day's
 * metadata within its routine + the ordered exercise plan, each exercise tapping
 * into its own detail. Read-only: changing the day is a request to the agent.
 * Doubles as the contract proposal for `GET /training/days/{id}/detail`.
 */
import type { DayType } from "./RoutineDashboard";

export interface DayExerciseItem {
  exerciseId: string; // slug → ejercicio/[id]
  index: number; // 1-based position in the plan
  name: string;
  isKey: boolean; // the day's principal lift
  muscle: string;
  equipment: string;
  target: string; // "82,5 kg" — display-ready
  sets: number;
  repRange: string; // "6–8"
  rir: number;
  rest: string; // "2:30" — display-ready
  lastResult: string | null; // "80 kg × 8"
  progression: string | null; // "+2,5"
}

export interface DayDetailHeader {
  dayId: string;
  type: DayType;
  routineName: string;
  dayNumber: number; // 1-based among training days
  trainingTotal: number; // training days in the rotation
  name: string; // "Legs A"
  dayOfWeek: string; // "Mié" — display-ready
  focus: string; // "Cuádriceps · glúteo · core"
  exercisesCount: number;
  setsCount: number;
  estimateMin: number; // 65
  volumeEstimate: string; // "9,2 t" — display-ready
}

export interface DayDetailView {
  header: DayDetailHeader;
  isRest: boolean;
  restFocus: string | null; // populated on a rest day
  agentNote: string | null; // carried for the contract; insights surface is parked
  exercises: DayExerciseItem[];
}
