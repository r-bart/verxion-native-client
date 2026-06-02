import type { SessionData } from "@/domain/auth/models/AuthUser";
import type { IAuthPort, SignInEmailInput } from "@/domain/auth/ports/IAuthPort";

export class SignInUseCase {
  constructor(private readonly port: IAuthPort) {}
  async execute(input: SignInEmailInput): Promise<SessionData> {
    return this.port.signInEmail(input);
  }
}
