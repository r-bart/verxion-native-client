import type { IAuthPort } from "@/domain/auth/ports/IAuthPort";

export class SignOutUseCase {
  constructor(private readonly port: IAuthPort) {}
  async execute(): Promise<void> {
    return this.port.signOut();
  }
}
