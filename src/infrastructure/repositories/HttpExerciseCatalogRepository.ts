import type { IExerciseCatalogPort } from "@/domain/training/ports/IExerciseCatalogPort";
import type { ExerciseSearchResult, ExerciseDetail, ExerciseFiltersData, ExerciseSearchParams } from "@/domain/training/models/Exercise";
import { apiClient } from "../api/apiClient";

export class HttpExerciseCatalogRepository implements IExerciseCatalogPort {
  async searchExercises(params: ExerciseSearchParams): Promise<ExerciseSearchResult[]> {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.bodyPart) query.set("bodyPart", params.bodyPart);
    if (params.equipment) query.set("equipment", params.equipment);
    if (params.target) query.set("target", params.target);
    if (params.customOnly) query.set("customOnly", "true");
    if (params.limit != null) query.set("limit", String(params.limit));
    if (params.offset != null) query.set("offset", String(params.offset));
    const qs = query.toString();
    return apiClient.get<ExerciseSearchResult[]>(`/exercises${qs ? `?${qs}` : ""}`);
  }

  async getExerciseDetail(id: string): Promise<ExerciseDetail> {
    return apiClient.get<ExerciseDetail>(`/exercises/${id}`);
  }

  async getExerciseFilters(): Promise<ExerciseFiltersData> {
    return apiClient.get<ExerciseFiltersData>(`/exercises/filters`);
  }
}
