/**
 * Shared domain vocabulary — fitness enums used by more than one domain module
 * (onboarding, settings). Lives in `domain/_shared` (a shared kernel) so peer
 * modules depend on this, never on each other: domain modules stay decoupled
 * while still speaking the same canonical wire values.
 *
 * These mirror the platform's schemas (`packages/shared`). UI copy lives in the
 * presentation layer; these are the literal values the API accepts.
 */
export type GenderType = "male" | "female" | "not_specified";

export type MeasurementSystemType = "metric" | "imperial";

export type FitnessGoalType =
  | "muscle_gain"
  | "fat_loss"
  | "strength"
  | "endurance"
  | "flexibility"
  | "general_fitness"
  | "athletic_performance"
  | "rehabilitation"
  | "recomposition";

export type ExperienceLevelType = "beginner" | "intermediate" | "advanced" | "pro";
