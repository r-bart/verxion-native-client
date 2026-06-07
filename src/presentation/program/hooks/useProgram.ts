import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";
import { programKeys } from "../keys";

/** A single program's overview (detail hero + coupling). */
export function useProgram(id: string) {
  const uc = useDI((c) => c.getProgram);
  return useQuery({
    queryKey: programKeys.detail(id),
    queryFn: () => uc.execute(id),
    enabled: id !== "",
    staleTime: 60_000,
  });
}
