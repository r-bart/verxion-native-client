import type { IAuthPort, SignInEmailInput } from "@/domain/auth/ports/IAuthPort";
import type { SessionData } from "@/domain/auth/models/AuthUser";
import { authClient } from "../auth/authClient";
import { getAppleCredential } from "../auth/appleCredentialProvider";

export class HttpAuthRepository implements IAuthPort {
  /**
   * Google OAuth. `@better-auth/expo` opens an in-app browser for the
   * provider redirect and stores the resulting session cookie. Passing a
   * leading-"/" `callbackURL` makes the plugin build the app deep link it
   * waits to be redirected back to.
   *
   * A genuine OAuth failure surfaces via `error` and is thrown. Dismissing the
   * browser is deliberately a silent no-op (no `error`, no session): the
   * `AuthGuard` simply keeps the user on the login screen, matching the silent
   * behaviour of an Apple-sheet cancellation.
   */
  async signInWithGoogle(): Promise<void> {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
    if (error) throw new Error(error.message || "Google sign in failed");
  }

  /**
   * Apple Sign In. Acquires the native credential (device I/O lives in the
   * provider), then verifies the identity token server-side. No browser. We
   * re-read the session afterwards so the mapped shape stays identical to
   * `getSession` regardless of the social response. Propagates
   * `SignInCancelled` from the provider when the user dismisses the sheet.
   *
   * The first-authorization display name is forwarded via `fetchOptions.body`
   * (same channel the web app uses for `acceptsLegal`/`locale`) because Apple's
   * identity token carries no name claim — the API's `user.create` hook reads
   * `body.name` to seed the profile.
   */
  async signInWithApple(): Promise<SessionData> {
    const credential = await getAppleCredential();

    const { error } = await authClient.signIn.social({
      provider: "apple",
      idToken: { token: credential.idToken, nonce: credential.nonce },
      ...(credential.name
        ? { fetchOptions: { body: { name: credential.name } } }
        : {}),
    } as Parameters<typeof authClient.signIn.social>[0]);
    if (error) throw new Error(error.message || "Apple sign in failed");

    const session = await this.getSession();
    if (!session) throw new Error("Apple sign in failed");
    return session;
  }

  /**
   * Email + password sign-in. Reviewer-only — the API rejects emails outside
   * its allowlist. Re-reads the session so the mapped shape matches the other
   * sign-in paths.
   */
  async signInEmail(input: SignInEmailInput): Promise<SessionData> {
    const { error } = await authClient.signIn.email({
      email: input.email,
      password: input.password,
    });
    if (error) throw new Error(error.message || "Sign in failed");

    const session = await this.getSession();
    if (!session) throw new Error("Sign in failed");
    return session;
  }

  async signOut(): Promise<void> {
    const { error } = await authClient.signOut();
    if (error) throw new Error(error.message || "Sign out failed");
  }

  async getSession(): Promise<SessionData | null> {
    const session = await authClient.getSession();
    if (!session.data) return null;
    return {
      user: {
        id: session.data.user.id,
        email: session.data.user.email,
        name: session.data.user.name,
        image: session.data.user.image ?? null,
        emailVerified: session.data.user.emailVerified,
      },
      session: {
        token: session.data.session.token,
        userId: session.data.session.userId,
        expiresAt: new Date(session.data.session.expiresAt),
      },
    };
  }
}
