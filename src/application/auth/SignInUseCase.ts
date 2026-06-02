import type { SessionData } from "@/domain/auth/models/AuthUser";
import type { IAuthPort, SignInEmailInput } from "@/domain/auth/ports/IAuthPort";

/**
 * Email + password sign-in. Reviewer-only path — the platform rejects emails
 * outside its `AUTH_REVIEWER_EMAILS` allowlist.
 */
export class SignInUseCase {
  constructor(private readonly port: IAuthPort) {}
  async execute(input: SignInEmailInput): Promise<SessionData> {
    return this.port.signInEmail(input);
  }
}
