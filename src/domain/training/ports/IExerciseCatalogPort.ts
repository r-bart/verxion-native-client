import type { ExerciseSearchResult, ExerciseDetail, ExerciseFiltersData, ExerciseSearchParams } from "../models/Exercise";

export interface IExerciseCatalogPort {
  searchExercises(params: ExerciseSearchParams): Promise<ExerciseSearchResult[]>;
  getExerciseDetail(id: string): Promise<ExerciseDetail>;
  getExerciseFilters(): Promise<ExerciseFiltersData>;
}
