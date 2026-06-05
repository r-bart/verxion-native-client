import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDI } from "@/infrastructure/di/DIContext";

// Mirrors the backend validation (packages/shared profile schema):
// 1-15 chars, lowercase letters, numbers, underscores.
const USERNAME_REGEX = /^[a-z0-9_]{1,15}$/;
const DEBOUNCE_MS = 300;

/**
 * Result of a username check. `errorCode` is a stable, non-localized signal —
 * consumers map it to their own copy (onboarding `copy`, settings i18n) so this
 * shared hook stays free of feature-specific strings.
 */
export interface UsernameAvailability {
  isAvailable: boolean;
  isValid: boolean;
  isChecking: boolean;
  errorCode?: "invalid" | "checkError";
}

/**
 * Debounced username availability check (300ms). Short-circuits on empty input,
 * invalid format, and when the value equals the user's current username. Shared
 * by onboarding and settings; lives in `_shared` so neither feature owns it.
 */
export function useUsernameAvailability(
  username: string,
  currentUsername?: string,
): UsernameAvailability {
  const checkUsername = useDI((c) => c.checkUsername);
  const trimmed = username.trim().toLowerCase();
  const normalizedCurrent = currentUsername?.trim().toLowerCase();
  const isValidFormat = USERNAME_REGEX.test(trimmed);
  const isSameAsCurrent =
    normalizedCurrent != null &&
    normalizedCurrent.length > 0 &&
    trimmed === normalizedCurrent;

  const [debounced, setDebounced] = useState(trimmed);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [trimmed]);

  const debouncedIsValid = USERNAME_REGEX.test(debounced);
  const debouncedIsSameAsCurrent =
    normalizedCurrent != null &&
    normalizedCurrent.length > 0 &&
    debounced === normalizedCurrent;

  const query = useQuery({
    queryKey: ["username-availability", debounced],
    queryFn: () => checkUsername.execute(debounced),
    enabled: debouncedIsValid && !debouncedIsSameAsCurrent,
    staleTime: 30_000,
    retry: false,
  });

  if (trimmed.length === 0) {
    return { isAvailable: false, isValid: false, isChecking: false };
  }
  if (!isValidFormat) {
    return { isAvailable: false, isValid: false, isChecking: false, errorCode: "invalid" };
  }
  if (isSameAsCurrent) {
    return { isAvailable: true, isValid: true, isChecking: false };
  }
  if (debounced !== trimmed || query.isLoading || query.isFetching) {
    return { isAvailable: false, isValid: true, isChecking: true };
  }
  if (query.isError) {
    return { isAvailable: false, isValid: true, isChecking: false, errorCode: "checkError" };
  }

  const data = query.data;
  return {
    isAvailable: data?.isAvailable ?? false,
    isValid: data?.isValid ?? true,
    isChecking: false,
  };
}
