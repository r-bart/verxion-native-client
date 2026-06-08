export interface ExerciseSearchResult {
  id: string;
  name: string;
  targetMuscle: string | null;
  bodyPart: string | null;
  equipment: string | null;
  difficultyLevel: number | null;
  similarity: number | null;
}

export interface ExerciseDetail {
  id: string;
  name: string;
  externalId?: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
  /** Demo animation URL (optional in the contract) — the guide tab renders it if present. */
  gifUrl?: string;
  note?: string;
  profileId?: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseFiltersData {
  bodyParts: string[];
  equipment: string[];
  muscleTargets: string[];
}

export interface ExerciseSearchParams {
  q?: string;
  bodyPart?: string;
  equipment?: string;
  target?: string;
  customOnly?: boolean;
  limit?: number;
  offset?: number;
}
