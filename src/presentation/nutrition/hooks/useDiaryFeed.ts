import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { nutritionKeys } from "../keys";

/**
 * The diary feed — logged days grouped by phase + a rolling summary. Reads via
 * `GetDiaryFeedUseCase` against the curated `GET /nutrition/diary-feed`. Sends the
 * device timezone offset (negated `getTimezoneOffset`, east-positive) to bucket
 * days correctly.
 */
export function useDiaryFeed() {
  const uc = useDI((c) => c.getDiaryFeed);
  const tzOffsetMinutes = -new Date().getTimezoneOffset();
  return useQuery({
    queryKey: nutritionKeys.diaryFeed(),
    queryFn: () => uc.execute(tzOffsetMinutes),
    staleTime: 60_000,
  });
}
