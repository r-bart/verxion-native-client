import { mapSessionDetail, type WorkoutSessionDetailDTO } from "../sessionDetailMapper";

function dto(overrides: Partial<WorkoutSessionDetailDTO> = {}): WorkoutSessionDetailDTO {
  return {
    session: {
      id: "s1",
      name: "Legs B",
      status: "completed",
      sessionType: "strength",
      dayType: "workout",
      startedAt: "2026-05-31T18:00:00.000Z",
      completedAt: "2026-05-31T19:06:00.000Z",
      durationSeconds: 3960,
      notes: "Buen día",
      routine: { id: "r1", name: "PPL Hipertrofia" },
      mesocycle: {
        id: "meso-acc",
        name: "Acumulación",
        goal: "Volumen",
        orderIndex: 0,
        totalBlocks: 3,
        week: 3,
        weeks: 6,
      },
    },
    assessment: {
      pre: {},
      post: {
        overallFeeling: 8,
        effortScore: 9,
        pump: 9,
        qualityScore: 8,
        standardizationScore: null,
        commitmentLevel: null,
        notes: "RDL fina",
      },
    },
    summary: {
      totalVolume: 16300,
      totalSets: 23,
      totalReps: 182,
      totalDurationSeconds: 3960,
      averageRir: 2,
      peakWeight: 125,
      completionRate: 1,
      exerciseCompletionRate: 1,
      summaryGeneratedAt: "2026-05-31T19:10:00.000Z",
      recap: "Sesión sólida.",
      exercises: [
        {
          exerciseId: "peso-muerto-rumano",
          exerciseName: "Peso muerto rumano",
          muscle: "Femoral",
          equipment: "Barra",
          prescription: { sets: 4, reps: "6-8", rir: 2 },
          sets: [
            { setNumber: 1, weight: 125, reps: 8, rir: 2, volume: 1000, isWarmup: false },
            { setNumber: 2, weight: 122.5, reps: 7, rir: 1, volume: 857.5, isWarmup: false },
          ],
        },
      ],
      muscleGroupDistribution: {
        Femoral: { volume: 5200, percentage: 40, exercises: 2 },
        Glúteo: { volume: 7800, percentage: 60, exercises: 1 },
      },
    },
    ...overrides,
  };
}

describe("mapSessionDetail", () => {
  it("carries raw header + tiles straight through (no formatting)", () => {
    const v = mapSessionDetail(dto());

    expect(v.header.name).toBe("Legs B");
    expect(v.header.type).toBe("workout");
    expect(v.header.routineName).toBe("PPL Hipertrofia");
    expect(v.header.completedAt).toBe("2026-05-31T19:06:00.000Z"); // raw ISO, no formatting
    expect(v.header.completionPct).toBe(100); // exerciseCompletionRate (0..1) → 0..100
    expect(v.header.perfectPlan).toBe(true);
    expect(v.tiles).toEqual({ volumeKg: 16300, durationSec: 3960, series: 23, reps: 182, peakKg: 125, avgRir: 2 });
  });

  it("carries the frozen mesocycle block through (raw), null when absent", () => {
    expect(mapSessionDetail(dto()).header.mesocycle).toEqual({
      id: "meso-acc",
      name: "Acumulación",
      goal: "Volumen",
      orderIndex: 0,
      totalBlocks: 3,
      week: 3,
      weeks: 6,
    });

    const flat = mapSessionDetail(dto({ session: { ...dto().session, mesocycle: null } }));
    expect(flat.header.mesocycle).toBeNull();
  });

  it("keeps per-set weight/reps and the prescription raw", () => {
    const ex = mapSessionDetail(dto()).exercises[0];
    expect(ex.name).toBe("Peso muerto rumano");
    expect(ex.prescription).toEqual({ sets: 4, reps: "6-8", rir: 2 });
    expect(ex.sets).toEqual([
      { weight: 125, reps: 8 },
      { weight: 122.5, reps: 7 },
    ]);
  });

  it("sorts the muscle split by raw kg volume, top-N, percentage as-is", () => {
    const muscles = mapSessionDetail(dto()).muscles;
    expect(muscles[0]).toEqual({ name: "Glúteo", volumeKg: 7800, pct: 60 });
    expect(muscles[1]).toEqual({ name: "Femoral", volumeKg: 5200, pct: 40 });
  });

  it("pulls the post assessment and falls back the note to the session", () => {
    const v = mapSessionDetail(dto());
    expect(v.assessment).toEqual({ effort: 9, quality: 8, pump: 9 });
    expect(v.note).toBe("RDL fina");
  });

  it("returns a null assessment when the post scores are all empty", () => {
    const v = mapSessionDetail(
      dto({
        assessment: {
          pre: {},
          post: { overallFeeling: null, effortScore: null, pump: null, qualityScore: null, standardizationScore: null, commitmentLevel: null, notes: null },
        },
        session: { ...dto().session, notes: "solo nota de sesión" },
      }),
    );
    expect(v.assessment).toBeNull();
    expect(v.note).toBe("solo nota de sesión");
  });

  it("degrades gracefully when the summary has not been generated", () => {
    const v = mapSessionDetail(dto({ summary: null }));
    expect(v.recap).toBe("");
    expect(v.exercises).toEqual([]);
    expect(v.muscles).toEqual([]);
    expect(v.tiles.volumeKg).toBe(0);
    expect(v.header.completionPct).toBe(0);
  });
});
