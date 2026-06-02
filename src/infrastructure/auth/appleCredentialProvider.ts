import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { SignInCancelled } from "@/domain/auth/errors/SignInCancelled";

/**
 * Native Apple credential acquired from the device. `idToken` is the Apple
 * identity JWT; `nonce` is the raw nonce we generated and handed to Apple (the
 * API checks it against the token's `nonce` claim); `name` is only present on
 * the very first authorization (Apple omits it on subsequent sign-ins).
 */
export interface AppleCredential {
  idToken: string;
  nonce: string;
  name: string | null;
}

function isCancellation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ERR_REQUEST_CANCELED"
  );
}

/**
 * Drives the native Sign in with Apple sheet and returns the credential. This
 * is device I/O, so it lives in infrastructure — the presentation layer only
 * triggers it through a use case. Throws `SignInCancelled` when the user
 * dismisses the sheet.
 */
export async function getAppleCredential(): Promise<AppleCredential> {
  // Raw nonce handed to Apple and later forwarded to the API; the API matches
  // it against the identity token's `nonce` claim to prevent token replay.
  const nonce = Crypto.randomUUID();

  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce,
    });
  } catch (error) {
    if (isCancellation(error)) throw new SignInCancelled();
    throw error;
  }

  if (!credential.identityToken) {
    throw new Error("Apple did not return an identity token");
  }

  // Apple only returns the name on the first authorization. Join the parts when
  // present so the API can seed the profile display name.
  const name =
    [credential.fullName?.givenName, credential.fullName?.familyName]
      .filter(Boolean)
      .join(" ")
      .trim() || null;

  return { idToken: credential.identityToken, nonce, name };
}
