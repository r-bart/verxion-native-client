import { useInfiniteQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { trainingKeys } from "../keys";
import type { ExerciseSearchParams } from "@/domain/training/models/Exercise";

const PAGE_SIZE = 20;

export function useExerciseSearch(params: Omit<ExerciseSearchParams, "limit" | "offset">) {
  const uc = useDI((c) => c.listExercises);

  const keyParams: Record<string, string | undefined> = {
    q: params.q,
    bodyPart: params.bodyPart,
    equipment: params.equipment,
    target: params.target,
    customOnly: params.customOnly ? "true" : undefined,
  };

  return useInfiniteQuery({
    queryKey: trainingKeys.exerciseSearch(keyParams),
    queryFn: ({ pageParam = 0 }) =>
      uc.execute({ ...params, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
  });
}
