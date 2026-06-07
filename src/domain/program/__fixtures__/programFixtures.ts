/**
 * programFixtures — typed example payloads for the program read surface, doubling
 * as the contract proposal for `GET /programs*` (see `docs/program-screen-spec.md`).
 * Layer-neutral (imports only domain types) so the infrastructure stub and tests
 * share them. Mirrors the handoff's `programas-data.jsx`: one active program, two
 * completed (archive), and one draft.
 *
 * TEMPORARY: served by the repository stub until the read-models ship; then the
 * repo swaps to `apiClient` and these stay as the test payloads.
 */
import type { ProgramOverview } from "../models/Program";
import type { ProgramAdherence } from "../models/ProgramAdherence";

export const programOverviewsFixture: ProgramOverview[] = [
  {
    id: "recomp-primavera",
    name: "Recomposición de primavera",
    description:
      "Subir fuerza mientras bajas grasa: PPL de hipertrofia acoplado a un déficit ligero con la proteína bien alta.",
    goal: "recomp",
    status: "active",
    durationType: "date_range",
    startDate: "2026-05-13",
    endDate: "2026-06-24",
    finishedDate: null,
    createdAt: "2026-05-13",
    updatedAt: "2026-06-07",
    week: 3,
    totalWeeks: 6,
    weekFrac: 3 / 7,
    weeklySchedule: ["training", "training", "training", "training", "training", "refeed", "rest"],
    routine: {
      id: "ppl-hipertrofia",
      name: "PPL Hipertrofia",
      type: "split",
      week: 3,
      totalWeeks: 6,
      adherenceScore: 86,
    },
    dietPlan: {
      id: "definicion-2250",
      name: "Definición",
      calories: 2250,
      protein: 180,
      week: 3,
      totalWeeks: 6,
      adherenceScore: 92,
    },
    unifiedExecutionScore: 84,
    adherenceState: "ahead",
    agentNote:
      "Tu mejor recomp hasta ahora: semana 3 y vas adelantado en los dos frentes. El entreno sostiene volumen al alza y la dieta cierra al 92 % de adherencia. Mantenemos el déficit ligero dos semanas más y reevaluamos cargas.",
  },
  {
    id: "volumen-invierno",
    name: "Volumen de invierno",
    description:
      "Ocho semanas de superávit limpio para construir músculo sobre la base de fuerza ya asentada.",
    goal: "muscle_gain",
    status: "completed",
    durationType: "date_range",
    startDate: "2026-01-06",
    endDate: "2026-03-01",
    finishedDate: "2026-03-01",
    createdAt: "2026-01-06",
    updatedAt: "2026-03-01",
    week: 8,
    totalWeeks: 8,
    weekFrac: null,
    weeklySchedule: ["training", "training", "training", "training", "training", "training", "rest"],
    routine: {
      id: "ppl-base",
      name: "PPL Base",
      type: "split",
      week: 8,
      totalWeeks: 8,
      adherenceScore: 91,
    },
    dietPlan: {
      id: "volumen-2900",
      name: "Volumen",
      calories: 2900,
      protein: 200,
      week: 8,
      totalWeeks: 8,
      adherenceScore: 90,
    },
    unifiedExecutionScore: 90,
    adherenceState: "ahead",
    agentNote:
      "Ocho semanas de volumen limpio que te dejaron listo para definir. Subiste fuerza en todos los básicos y la adherencia se mantuvo al 90 % en entreno y dieta. La base de músculo que ahora estás puliendo.",
  },
  {
    id: "base-adaptacion",
    name: "Base de adaptación",
    description:
      "Tu primer programa: cuatro semanas para fijar técnica y hábitos antes de subir cargas.",
    goal: "general_fitness",
    status: "completed",
    durationType: "date_range",
    startDate: "2025-12-02",
    endDate: "2025-12-30",
    finishedDate: "2025-12-30",
    createdAt: "2025-12-02",
    updatedAt: "2025-12-30",
    week: 4,
    totalWeeks: 4,
    weekFrac: null,
    weeklySchedule: ["training", "rest", "training", "rest", "training", "rest", "rest"],
    routine: {
      id: "iniciacion-fullbody",
      name: "Full-body inicio",
      type: "fullbody",
      week: 4,
      totalWeeks: 4,
      adherenceScore: 88,
    },
    dietPlan: {
      id: "mantenimiento-2500",
      name: "Mantenimiento",
      calories: 2500,
      protein: 150,
      week: 4,
      totalWeeks: 4,
      adherenceScore: 86,
    },
    unifiedExecutionScore: 87,
    adherenceState: "ahead",
    agentNote:
      "Tu punto de partida. Cuatro semanas de full-body y mantenimiento para fijar técnica y hábitos sin prisa. Misión cumplida: base sólida para todo lo que vino después.",
  },
  {
    id: "fuerza-q3",
    name: "Bloque de fuerza",
    description:
      "Un mesociclo de fuerza centrado en los básicos con progresión por dobles. verxion está terminando de armarlo.",
    goal: "strength",
    status: "draft",
    durationType: "indefinite",
    startDate: null,
    endDate: null,
    finishedDate: null,
    createdAt: "2026-06-07",
    updatedAt: null,
    week: 1,
    totalWeeks: 0,
    weekFrac: null,
    weeklySchedule: ["training", "rest", "training", "rest", "training", "rest", "training"],
    routine: null,
    dietPlan: null,
    unifiedExecutionScore: null,
    adherenceState: null,
    agentNote:
      "Estoy armando un bloque de fuerza de 4 días a la semana con progresión por dobles sobre sentadilla, banca, peso muerto y press. Antes de activarlo conviene acoplar una rutina y una dieta de mantenimiento — dímelo y lo dejo listo.",
  },
];

/** Full unified-adherence payloads keyed by program id. */
const adherenceById: Record<string, ProgramAdherence> = {
  "recomp-primavera": {
    programId: "recomp-primavera",
    programName: "Recomposición de primavera",
    dateRange: { from: "2026-05-13", to: "2026-06-07" },
    programContext: {
      programStartDate: "2026-05-13",
      programAgeDays: 25,
      effectiveWindowStart: "2026-05-13",
      effectiveWindowEnd: "2026-06-07",
      phase: "active_tracking",
    },
    training: {
      available: true,
      sessionsCompleted: 14,
      sessionsExpected: 36,
      adherencePercent: 86,
      executionScore: 86,
      executionBreakdown: null,
    },
    diet: {
      available: true,
      daysTracked: 19,
      daysExpected: 21,
      adherencePercent: 92,
      avgCalorieAdherence: 92,
      executionScore: 92,
      executionBreakdown: null,
      executionClassificationDistribution: null,
    },
    overallAdherencePercent: 89,
    unifiedExecutionScore: 84,
    isPartial: false,
    availableDomains: ["training", "nutrition"],
    confidence: "high",
    overallInterpretation: {
      isProvisional: false,
      summary:
        "Datos suficientes para una lectura fiable: vas adelantado en los dos frentes.",
    },
  },
  "volumen-invierno": {
    programId: "volumen-invierno",
    programName: "Volumen de invierno",
    dateRange: { from: "2026-01-06", to: "2026-03-01" },
    programContext: {
      programStartDate: "2026-01-06",
      programAgeDays: 54,
      effectiveWindowStart: "2026-01-06",
      effectiveWindowEnd: "2026-03-01",
      phase: "active_tracking",
    },
    training: {
      available: true,
      sessionsCompleted: 44,
      sessionsExpected: 48,
      adherencePercent: 91,
      executionScore: 91,
      executionBreakdown: null,
    },
    diet: {
      available: true,
      daysTracked: 50,
      daysExpected: 56,
      adherencePercent: 90,
      avgCalorieAdherence: 90,
      executionScore: 90,
      executionBreakdown: null,
      executionClassificationDistribution: null,
    },
    overallAdherencePercent: 90,
    unifiedExecutionScore: 90,
    isPartial: false,
    availableDomains: ["training", "nutrition"],
    confidence: "high",
    overallInterpretation: {
      isProvisional: false,
      summary: "Programa cerrado al 90 % de adherencia unificada.",
    },
  },
  "base-adaptacion": {
    programId: "base-adaptacion",
    programName: "Base de adaptación",
    dateRange: { from: "2025-12-02", to: "2025-12-30" },
    programContext: {
      programStartDate: "2025-12-02",
      programAgeDays: 28,
      effectiveWindowStart: "2025-12-02",
      effectiveWindowEnd: "2025-12-30",
      phase: "active_tracking",
    },
    training: {
      available: true,
      sessionsCompleted: 11,
      sessionsExpected: 12,
      adherencePercent: 88,
      executionScore: 88,
      executionBreakdown: null,
    },
    diet: {
      available: true,
      daysTracked: 24,
      daysExpected: 28,
      adherencePercent: 86,
      avgCalorieAdherence: 86,
      executionScore: 86,
      executionBreakdown: null,
      executionClassificationDistribution: null,
    },
    overallAdherencePercent: 87,
    unifiedExecutionScore: 87,
    isPartial: false,
    availableDomains: ["training", "nutrition"],
    confidence: "high",
    overallInterpretation: {
      isProvisional: false,
      summary: "Base sólida: técnica y hábitos fijados al 87 %.",
    },
  },
  // Draft — cold-start: no data yet, the detail softens/hides the ring.
  "fuerza-q3": {
    programId: "fuerza-q3",
    programName: "Bloque de fuerza",
    dateRange: { from: null, to: null },
    programContext: {
      programStartDate: null,
      programAgeDays: null,
      effectiveWindowStart: "2026-06-07",
      effectiveWindowEnd: "2026-06-07",
      phase: "cold_start",
    },
    training: null,
    diet: null,
    overallAdherencePercent: 0,
    unifiedExecutionScore: null,
    isPartial: true,
    availableDomains: [],
    confidence: "none",
    overallInterpretation: {
      isProvisional: true,
      summary: "Aún sin datos: el programa todavía no está activo.",
    },
  },
};

export function programOverviewByIdFixture(id: string): ProgramOverview {
  return (
    programOverviewsFixture.find((p) => p.id === id) ?? programOverviewsFixture[0]
  );
}

export function activeProgramOverviewFixture(): ProgramOverview | null {
  return programOverviewsFixture.find((p) => p.status === "active") ?? null;
}

export function programAdherenceByIdFixture(id: string): ProgramAdherence {
  return adherenceById[id] ?? adherenceById["recomp-primavera"];
}
