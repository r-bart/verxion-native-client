import type { IAuthPort, SignUpEmailInput } from "@/domain/auth/ports/IAuthPort";

export class SignUpUseCase {
  constructor(private readonly port: IAuthPort) {}
  async execute(input: SignUpEmailInput): Promise<{ userId: string }> {
    return this.port.signUpEmail(input);
  }
}
