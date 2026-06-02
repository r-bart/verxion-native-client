import { useMutation } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";

export function useSignUp() {
  const uc = useDI((c) => c.signUp);
  return useMutation({
    mutationFn: uc.execute.bind(uc),
  });
}
