import type {
  IAuthPort,
  SignInEmailInput,
  SignUpEmailInput,
} from "@/domain/auth/ports/IAuthPort";
import type { SessionData } from "@/domain/auth/models/AuthUser";
import { authClient } from "../auth/authClient";

export class HttpAuthRepository implements IAuthPort {
  async signInEmail(input: SignInEmailInput): Promise<SessionData> {
    const { data, error } = await authClient.signIn.email({
      email: input.email,
      password: input.password,
    });
    if (error || !data) throw new Error(error?.message || "Sign in failed");
    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        image: data.user.image ?? null,
        emailVerified: data.user.emailVerified,
      },
      session: {
        token: data.token ?? "",
        userId: data.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    };
  }

  async signUpEmail(input: SignUpEmailInput): Promise<{ userId: string }> {
    const { data, error } = await authClient.signUp.email({
      email: input.email,
      password: input.password,
      name: input.name,
    });
    if (error || !data) throw new Error(error?.message || "Sign up failed");
    return { userId: data.user.id };
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
