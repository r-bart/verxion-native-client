/**
 * The auth provider the user last signed in with, in `expo-secure-store`.
 *
 * Surfaces a "Last used" hint on the login screen so a returning user is nudged
 * back to the same provider. Persisted independently of the Better Auth session
 * cookie, so it deliberately *survives sign-out* (that's the whole point — the
 * hint should still be there next time they land on login). Best-effort,
 * mirroring `languagePreference`: a failed read/write just means no hint shows.
 * Exposed via the DI container (`lastAuthProvider`) so presentation reaches it
 * through `useDI`, never importing infrastructure directly.
 */
import * as SecureStore from "expo-secure-store";

export type AuthProvider = "google" | "apple" | "reviewer";

const STORAGE_KEY = "lastAuthProvider";

function isProvider(value: string | null): value is AuthProvider {
  return value === "google" || value === "apple" || value === "reviewer";
}

export async function getLastAuthProvider(): Promise<AuthProvider | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return isProvider(raw) ? raw : null;
  } catch {
    return null;
  }
}

export async function setLastAuthProvider(provider: AuthProvider): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, provider);
  } catch {
    // Best-effort — a failed write just means the hint isn't remembered.
  }
}
