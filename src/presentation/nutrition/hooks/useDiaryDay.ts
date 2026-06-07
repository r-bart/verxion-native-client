import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { nutritionKeys } from "../keys";

/**
 * A closed day's diary detail. Reads via `GetDiaryDayUseCase` against the curated
 * `GET /nutrition/diary-day/{date}`, sending the device timezone offset.
 */
export function useDiaryDay(date: string) {
  const uc = useDI((c) => c.getDiaryDay);
  const tzOffsetMinutes = -new Date().getTimezoneOffset();
  return useQuery({
    queryKey: nutritionKeys.diaryDay(date),
    queryFn: () => uc.execute(date, tzOffsetMinutes),
    enabled: date !== "",
    staleTime: 60_000,
  });
}
