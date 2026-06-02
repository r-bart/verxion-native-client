import type { SessionData } from "@/domain/auth/models/AuthUser";
import type { IAuthPort } from "@/domain/auth/ports/IAuthPort";

export class SignInWithAppleUseCase {
  constructor(private readonly port: IAuthPort) {}
  async execute(): Promise<SessionData> {
    return this.port.signInWithApple();
  }
}
