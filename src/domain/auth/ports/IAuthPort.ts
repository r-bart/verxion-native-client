import type { SessionData } from "../models/AuthUser";

/**
 * Email + password credential. NOT a general user path — the platform keeps
 * email sign-up disabled and only accepts these for allowlisted App Store /
 * Play Store reviewer accounts (`AUTH_REVIEWER_EMAILS`). Surfaced in the app
 * solely through the hidden reviewer form.
 */
export interface SignInEmailInput {
  email: string;
  password: string;
}

export interface IAuthPort {
  /**
   * Google sign-in via the platform's OAuth flow. Opens an in-app browser,
   * redirects back through the app scheme, and stores the session cookie.
   * Resolves once the flow completes (read the session via `getSession`).
   */
  signInWithGoogle(): Promise<void>;
  /**
   * Apple sign-in (no browser). The native credential is acquired and verified
   * entirely within infrastructure; the caller just triggers it. Returns the
   * established session. Throws `SignInCancelled` if the user dismisses the
   * native sheet.
   */
  signInWithApple(): Promise<SessionData>;
  /**
   * Email + password sign-in. Reviewer-only (see {@link SignInEmailInput});
   * the API rejects non-allowlisted emails. Returns the established session.
   */
  signInEmail(input: SignInEmailInput): Promise<SessionData>;
  signOut(): Promise<void>;
  getSession(): Promise<SessionData | null>;
}
