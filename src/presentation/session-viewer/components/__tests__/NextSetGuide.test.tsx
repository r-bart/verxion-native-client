/**
 * @generated-from thoughts/specs/2026-03-28_per-set-progression-guidance.md
 * @immutable Do NOT modify these tests — implementation must make them pass as-is.
 *
 * These tests encode the spec's acceptance criteria as executable assertions.
 * If a test seems wrong, update the spec and regenerate — don't edit tests directly.
 */

import React from "react";
import { render } from "@testing-library/react-native";
import { NextSetGuide } from "../NextSetGuide";
import type { PreviousExerciseComparison } from "@/domain/sessions/models/Session";
import type { ProgressionExercise } from "@/domain/training/models/ProgressionPlan";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeProgressionTarget = (overrides?: Partial<ProgressionExercise>): ProgressionExercise => ({
  exerciseId: "ex-1",
  exerciseName: "Bench Press",
  setType: "regular",
  action: "increase_weight",
  confidence: 0.9,
  basis: "sufficient_data",
  reasoning: ["Keep progressing"],
  lastPerformance: {
    sets: 3,
    weight: 60,
    avgReps: 10,
    avgRir: 2,
    totalVolume: 1800,
  },
  nextPrescription: {
    sets: 3,
    weight: 62.5,
    repRange: { minReps: 8, maxReps: 12 },
    rir: 2,
  },
  ...overrides,
});

const makePreviousExercise = (overrides?: Partial<PreviousExerciseComparison>): PreviousExerciseComparison => ({
  exerciseId: "ex-1",
  exerciseName: "Bench Press",
  completedSets: 3,
  peakWeight: 60,
  totalVolume: 1800,
  totalReps: 27,
  sets: [
    { setNumber: 1, weight: 60, reps: 10, rir: 2, volume: 600 },
    { setNumber: 2, weight: 60, reps: 9, rir: 2, volume: 540 },
    { setNumber: 3, weight: 60, reps: 8, rir: 1, volume: 480 },
  ],
  ...overrides,
});

// ─── Null guard tests (US-2/AC-4) ────────────────────────────────────────────

describe("NextSetGuide — null guards", () => {
  it("returns null when all sets are completed (completedSets >= plannedSets)", () => {
    // Spec: US-2/AC-4 — If all sets completed, do not show Next Set
    const { toJSON } = render(
      <NextSetGuide
        completedSets={3}
        plannedSets={3}
        progressionTarget={makeProgressionTarget()}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it("returns null when completedSets exceeds plannedSets", () => {
    // Spec: EC-1 — completedSets >= plannedSets
    const { toJSON } = render(
      <NextSetGuide
        completedSets={4}
        plannedSets={3}
        progressionTarget={makeProgressionTarget()}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it("returns null when neither progressionTarget nor previousExercise are provided", () => {
    // Spec: US-2/AC-5 — no data to show → don't render
    const { toJSON } = render(
      <NextSetGuide
        completedSets={1}
        plannedSets={3}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it("returns null when previousExercise has no set matching nextSetNumber and no progressionTarget", () => {
    // Spec: EC-2 — previousExercise exists but no matching set → nothing to show
    const prevWithNoSets = makePreviousExercise({ sets: [] });
    const { toJSON } = render(
      <NextSetGuide
        completedSets={1}
        plannedSets={3}
        previousExercise={prevWithNoSets}
      />
    );
    expect(toJSON()).toBeNull();
  });
});

// ─── Header rendering (US-2/AC-1) ────────────────────────────────────────────

describe("NextSetGuide — header", () => {
  it("shows 'Set N / total' header with next set number", () => {
    // Spec: US-2/AC-1 — card shows set number
    const { getByText } = render(
      <NextSetGuide
        completedSets={1}
        plannedSets={3}
        progressionTarget={makeProgressionTarget()}
      />
    );
    expect(getByText("Set 2 / 3")).toBeTruthy();
  });

  it("shows set 1 / N when completedSets is 0", () => {
    // Spec: US-2/AC-1
    const { getByText } = render(
      <NextSetGuide
        completedSets={0}
        plannedSets={3}
        progressionTarget={makeProgressionTarget()}
      />
    );
    expect(getByText("Set 1 / 3")).toBeTruthy();
  });
});

// ─── Target row from progressionTarget (US-2/AC-2) ───────────────────────────

describe("NextSetGuide — Target row", () => {
  it("shows Target row with weight × repRange · RIR from progressionTarget", () => {
    // Spec: US-2/AC-2 — target is nextPrescription.weight × repRange · RIR
    const { getByText } = render(
      <NextSetGuide
        completedSets={1}
        plannedSets={3}
        progressionTarget={makeProgressionTarget()}
      />
    );
    // "62.5kg × 8–12 · RIR 2"
    expect(getByText(/62\.5kg/)).toBeTruthy();
    expect(getByText(/8.12/)).toBeTruthy();
    expect(getByText(/RIR 2/)).toBeTruthy();
  });

  it("shows 'BW' in target row when weight is null (bodyweight)", () => {
    // Spec: EC-1 — target.weight null (bodyweight) → formatWeight returns 'BW'
    const target = makeProgressionTarget({
      nextPrescription: {
        sets: 3,
        weight: null as unknown as number,
        repRange: { minReps: 10, maxReps: 15 },
        rir: 1,
      },
    });
    const { getByText } = render(
      <NextSetGuide
        completedSets={0}
        plannedSets={3}
        progressionTarget={target}
      />
    );
    expect(getByText(/BW/)).toBeTruthy();
  });

  it("does not show Target row when progressionTarget is absent", () => {
    // Spec: US-2/AC-3 — only previousExercise: show Last, no Target label
    const { queryByText } = render(
      <NextSetGuide
        completedSets={1}
        plannedSets={3}
        previousExercise={makePreviousExercise()}
      />
    );
    expect(queryByText("Target")).toBeNull();
  });
});

// ─── Last row from previousExercise (US-2/AC-3) ──────────────────────────────

describe("NextSetGuide — Last row", () => {
  it("shows Last row with weight × reps · RIR from the matching previous set", () => {
    // Spec: US-2/AC-3 — Last row shows previousExercise.sets[nextSetNumber]
    const { getByText } = render(
      <NextSetGuide
        completedSets={1}
        plannedSets={3}
        previousExercise={makePreviousExercise()}
        progressionTarget={makeProgressionTarget()}
      />
    );
    // Set 2 was: 60kg × 9 · RIR 2
    expect(getByText(/60kg/)).toBeTruthy();
    expect(getByText(/9/)).toBeTruthy();
  });

  it("shows Last row without RIR when rir is undefined in previous set", () => {
    // Spec: EC-2 — prevSet.rir undefined → omit "· RIR N" suffix in Last row
    // No progressionTarget so only the Last row is rendered (Target row absent)
    const prev = makePreviousExercise({
      sets: [
        { setNumber: 1, weight: 50, reps: 8, rir: undefined, volume: 400 },
        { setNumber: 2, weight: 50, reps: 7, rir: undefined, volume: 350 },
      ],
    });
    const { queryByText, getByText } = render(
      <NextSetGuide
        completedSets={0}
        plannedSets={2}
        previousExercise={prev}
      />
    );
    // Last row renders weight and reps
    expect(getByText(/50kg/)).toBeTruthy();
    // RIR suffix must NOT appear when rir is undefined
    expect(queryByText(/RIR/)).toBeNull();
  });

  it("does not show Last row when previousExercise has no set for nextSetNumber", () => {
    // Spec: EC-2 — previousExercise.sets missing the requested set → no Last row
    const prev = makePreviousExercise({
      sets: [{ setNumber: 1, weight: 60, reps: 10, rir: 2, volume: 600 }],
    });
    const { queryByText } = render(
      <NextSetGuide
        completedSets={1}
        plannedSets={3}
        previousExercise={prev}
        progressionTarget={makeProgressionTarget()}
      />
    );
    // Set 2 doesn't exist in prev.sets
    expect(queryByText("Last")).toBeNull();
  });
});
